import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createProduct } from '@/app/actions/products'
import ProductForm from '@/components/ProductForm'

export default async function SellPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">판매글 작성</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <ProductForm action={createProduct} submitLabel="등록하기" />
      </div>
    </div>
  )
}
