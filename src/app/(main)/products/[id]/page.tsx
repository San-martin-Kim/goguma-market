import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteProduct } from '@/app/actions/products'

const statusStyle: Record<string, string> = {
  판매중: 'bg-orange-100 text-orange-600',
  예약중: 'bg-blue-100 text-blue-600',
  거래완료: 'bg-gray-200 text-gray-500',
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === product.seller_id

  const { data: seller } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', product.seller_id)
    .single()

  const createdAt = new Date(product.created_at).toLocaleDateString('ko-KR')

  return (
    <div className="max-w-screen-md mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 목록으로
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[product.status] ?? statusStyle['판매중']}`}>
            {product.status}
          </span>
          <span className="text-xs text-gray-400">{product.category}</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h1>
        <p className="text-2xl font-bold text-orange-500 mb-4">
          {product.price.toLocaleString('ko-KR')}원
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500 border-y border-gray-100 py-3 mb-4">
          <span className="font-medium text-gray-700">{seller?.nickname ?? '익명'}</span>
          <span>·</span>
          <span>{createdAt}</span>
        </div>

        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[80px]">
          {product.description || '설명이 없습니다.'}
        </p>

        {isOwner && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
            <Link
              href={`/products/${product.id}/edit`}
              className="flex-1 py-2.5 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              수정
            </Link>
            <form action={deleteProduct} className="flex-1">
              <input type="hidden" name="id" value={product.id} />
              <button
                type="submit"
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-500 font-semibold rounded-xl transition-colors"
              >
                삭제
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
