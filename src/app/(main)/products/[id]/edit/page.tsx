import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProduct } from '@/app/actions/products'
import ProductForm from '@/components/ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  // 본인 글이 아니면 상세 페이지로 돌려보냄
  if (product.seller_id !== user.id) {
    redirect(`/products/${id}`)
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">판매글 수정</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <ProductForm action={updateProduct} product={product} submitLabel="수정하기" />
      </div>
    </div>
  )
}
