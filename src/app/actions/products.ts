'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, STATUSES, type ProductState } from '@/lib/products'

function parseForm(formData: FormData) {
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() ?? ''
  const priceRaw = (formData.get('price') as string)?.trim()
  const category = (formData.get('category') as string) || '기타'
  const status = (formData.get('status') as string) || '판매중'

  return { title, description, priceRaw, category, status }
}

const MAX_IMAGES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

// 새로 올린 사진 파일들을 저장소에 업로드하고 주소 목록을 돌려줌
async function uploadImages(
  supabase: SupabaseClient,
  userId: string,
  files: File[]
): Promise<{ urls?: string[]; error?: string }> {
  const urls: string[] = []

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      return { error: '이미지 파일만 업로드할 수 있습니다.' }
    }
    if (file.size > MAX_FILE_SIZE) {
      return { error: '사진 한 장의 크기는 5MB 이하여야 합니다.' }
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type })

    if (error) {
      return { error: '사진 업로드 중 오류가 발생했습니다.' }
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return { urls }
}

// 사진 주소에서 저장소 내부 경로를 뽑아냄 (삭제용)
function urlToStoragePath(url: string): string | null {
  const marker = '/product-images/'
  const idx = url.indexOf(marker)
  return idx === -1 ? null : url.slice(idx + marker.length)
}

async function removeImages(supabase: SupabaseClient, urls: string[]) {
  const paths = urls.map(urlToStoragePath).filter((p): p is string => !!p)
  if (paths.length > 0) {
    await supabase.storage.from('product-images').remove(paths)
  }
}

function validate(title: string, priceRaw: string, category: string, status: string): string | null {
  if (!title) return '제목을 입력해주세요.'
  if (title.length > 100) return '제목은 100자 이내로 입력해주세요.'
  const price = Number(priceRaw)
  if (priceRaw === '' || Number.isNaN(price) || price < 0) {
    return '가격을 올바르게 입력해주세요. (0 이상의 숫자)'
  }
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return '카테고리를 올바르게 선택해주세요.'
  }
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return '거래 상태를 올바르게 선택해주세요.'
  }
  return null
}

// 등록 (Create)
export async function createProduct(state: ProductState, formData: FormData): Promise<ProductState> {
  const { title, description, priceRaw, category, status } = parseForm(formData)

  const errorMsg = validate(title, priceRaw, category, status)
  if (errorMsg) return { error: errorMsg }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  // 새로 올린 사진 파일들 (빈 파일 제외)
  const newFiles = (formData.getAll('images') as File[]).filter((f) => f.size > 0)
  if (newFiles.length > MAX_IMAGES) {
    return { error: `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있습니다.` }
  }

  const uploaded = await uploadImages(supabase, user.id, newFiles)
  if (uploaded.error) return { error: uploaded.error }

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      title,
      description,
      price: Number(priceRaw),
      category,
      status,
      image_urls: uploaded.urls,
    })
    .select('id')
    .single()

  if (error) {
    // 글 저장 실패 시 방금 올린 사진은 정리
    await removeImages(supabase, uploaded.urls ?? [])
    return { error: '판매글 등록 중 오류가 발생했습니다.' }
  }

  revalidatePath('/')
  redirect(`/products/${data.id}`)
}

// 수정 (Update)
export async function updateProduct(state: ProductState, formData: FormData): Promise<ProductState> {
  const id = formData.get('id') as string
  if (!id) return { error: '잘못된 접근입니다.' }

  const { title, description, priceRaw, category, status } = parseForm(formData)

  const errorMsg = validate(title, priceRaw, category, status)
  if (errorMsg) return { error: errorMsg }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  // 기존 사진 중 사용자가 남겨둔 것 + 새로 올린 것
  const keptImages = formData.getAll('existing_images') as string[]
  const newFiles = (formData.getAll('images') as File[]).filter((f) => f.size > 0)
  if (keptImages.length + newFiles.length > MAX_IMAGES) {
    return { error: `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있습니다.` }
  }

  const uploaded = await uploadImages(supabase, user.id, newFiles)
  if (uploaded.error) return { error: uploaded.error }

  const finalImages = [...keptImages, ...(uploaded.urls ?? [])]

  // 수정 전 사진 목록 조회 (삭제된 사진 정리용)
  const { data: before } = await supabase
    .from('products')
    .select('image_urls')
    .eq('id', id)
    .eq('seller_id', user.id)
    .single()

  const { error } = await supabase
    .from('products')
    .update({
      title,
      description,
      price: Number(priceRaw),
      category,
      status,
      image_urls: finalImages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) {
    await removeImages(supabase, uploaded.urls ?? [])
    return { error: '판매글 수정 중 오류가 발생했습니다.' }
  }

  // 더 이상 쓰지 않는 사진은 저장소에서 삭제
  const removed = (before?.image_urls ?? []).filter((u: string) => !keptImages.includes(u))
  await removeImages(supabase, removed)

  revalidatePath('/')
  revalidatePath(`/products/${id}`)
  redirect(`/products/${id}`)
}

// 삭제 (Delete)
export async function deleteProduct(formData: FormData): Promise<void> {
  const id = formData.get('id') as string
  if (!id) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 삭제 전 사진 목록 조회
  const { data: before } = await supabase
    .from('products')
    .select('image_urls')
    .eq('id', id)
    .eq('seller_id', user.id)
    .single()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id)

  // 글 삭제 성공 시 사진도 저장소에서 정리
  if (!error) {
    await removeImages(supabase, before?.image_urls ?? [])
  }

  revalidatePath('/')
  redirect('/')
}
