'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CATEGORIES, STATUSES, type ProductState } from '@/lib/products'

const MAX_IMAGES = 5

type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  status: string
  image_urls?: string[]
}

type Props = {
  action: (state: ProductState, formData: FormData) => Promise<ProductState>
  product?: Product
  submitLabel: string
}

export default function ProductForm({ action, product, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)

  // 수정 시 기존 사진 중 남겨둘 것들
  const [existingImages, setExistingImages] = useState<string[]>(product?.image_urls ?? [])
  // 새로 고른 파일들
  const [newFiles, setNewFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalCount = existingImages.length + newFiles.length

  // newFiles 상태를 실제 file input에 동기화 (폼 전송 시 이 파일들이 함께 감)
  useEffect(() => {
    if (!fileInputRef.current) return
    const dt = new DataTransfer()
    newFiles.forEach((f) => dt.items.add(f))
    fileInputRef.current.files = dt.files
  }, [newFiles])

  function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    const room = MAX_IMAGES - totalCount
    setNewFiles((prev) => [...prev, ...picked.slice(0, room)])
  }

  function removeExisting(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url))
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400'

  return (
    <form action={formAction} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      {/* 남겨둔 기존 사진 주소를 서버로 전달 */}
      {existingImages.map((url) => (
        <input key={url} type="hidden" name="existing_images" value={url} />
      ))}

      {/* 사진 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          사진 <span className="text-gray-400 font-normal">({totalCount}/{MAX_IMAGES})</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {existingImages.map((url) => (
            <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
              <Image src={url} alt="상품 사진" fill className="object-cover" sizes="96px" />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black/60 text-white rounded-full text-xs hover:bg-black/80"
                aria-label="사진 삭제"
              >
                ✕
              </button>
            </div>
          ))}

          {newFiles.map((file, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(file)} alt="새 사진" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewFile(i)}
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black/60 text-white rounded-full text-xs hover:bg-black/80"
                aria-label="사진 삭제"
              >
                ✕
              </button>
            </div>
          ))}

          {totalCount < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors"
            >
              <span className="text-2xl">📷</span>
              <span className="text-xs">추가</span>
            </button>
          )}
        </div>

        {/* 실제 파일 input: newFiles를 담아 서버로 전송 */}
        <input
          ref={fileInputRef}
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleSelectFiles}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-2">사진은 최대 {MAX_IMAGES}장, 한 장당 5MB까지 올릴 수 있어요.</p>
      </div>

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
