'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { CATEGORIES, STATUSES, type ProductState } from '@/lib/products'

type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  status: string
}

type Props = {
  action: (state: ProductState, formData: FormData) => Promise<ProductState>
  product?: Product
  submitLabel: string
}

export default function ProductForm({ action, product, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400'

  return (
    <form action={formAction} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          defaultValue={product?.title}
          placeholder="예) 거의 새것 같은 자전거 팝니다"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            가격 (원)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            required
            defaultValue={product?.price ?? 0}
            placeholder="0"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <select
            id="category"
            name="category"
            defaultValue={product?.category ?? '기타'}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          거래 상태
        </label>
        <select
          id="status"
          name="status"
          defaultValue={product?.status ?? '판매중'}
          className={inputClass}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={product?.description}
          placeholder="상품 상태, 거래 방법 등을 자세히 적어주세요."
          className={inputClass + ' resize-none'}
        />
      </div>

      {state?.error && (
        <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{state.error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href={product ? `/products/${product.id}` : '/'}
          className="flex-1 py-3 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
        >
          {pending ? '저장 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
