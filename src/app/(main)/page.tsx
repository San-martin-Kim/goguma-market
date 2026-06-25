import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const statusStyle: Record<string, string> = {
  판매중: 'bg-orange-100 text-orange-600',
  예약중: 'bg-blue-100 text-blue-600',
  거래완료: 'bg-gray-200 text-gray-500',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, category, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-screen-md mx-auto px-4 py-6">
      {/* 검색바 */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="어떤 물건을 찾고 계신가요?"
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 placeholder-gray-400"
          readOnly
        />
        <svg
          className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 카테고리 */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.label}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-xs text-gray-600 font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 상품 목록 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-gray-800">근처 중고 물품</h2>
        {user && (
          <Link
            href="/sell"
            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            + 판매 등록
          </Link>
        )}
      </div>

      {products && products.length > 0 ? (
        <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-orange-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[product.status] ?? statusStyle['판매중']}`}>
                    {product.status}
                  </span>
                  <span className="text-xs text-gray-400">{product.category}</span>
                </div>
                <p className="font-medium text-gray-800 truncate">{product.title}</p>
                <p className="font-bold text-orange-500 mt-0.5">
                  {product.price.toLocaleString('ko-KR')}원
                </p>
              </div>
              <span className="text-gray-300 text-xl shrink-0">›</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <span className="text-5xl mb-4">🍠</span>
            <p className="text-gray-500 font-medium">아직 등록된 물품이 없어요</p>
            <p className="text-gray-400 text-sm mt-1">첫 번째로 물건을 올려보세요!</p>
            {user ? (
              <Link
                href="/sell"
                className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                판매 시작하기
              </Link>
            ) : (
              <Link
                href="/login"
                className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                로그인하고 시작하기
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const categories = [
  { icon: '👗', label: '의류' },
  { icon: '📱', label: '전자기기' },
  { icon: '🪑', label: '가구/인테리어' },
  { icon: '📚', label: '도서' },
  { icon: '🧸', label: '완구/취미' },
  { icon: '🍳', label: '주방용품' },
  { icon: '🚲', label: '스포츠' },
  { icon: '🎮', label: '게임' },
]
