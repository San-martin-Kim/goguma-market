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

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      title,
      description,
      price: Number(priceRaw),
      category,
      status,
    })
    .select('id')
    .single()

  if (error) {
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

  const { error } = await supabase
    .from('products')
    .update({
      title,
      description,
      price: Number(priceRaw),
      category,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) {
    return { error: '판매글 수정 중 오류가 발생했습니다.' }
  }

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

  await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id)

  revalidatePath('/')
  redirect('/')
}
