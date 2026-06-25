export const CATEGORIES = [
  '의류',
  '전자기기',
  '가구/인테리어',
  '도서',
  '완구/취미',
  '주방용품',
  '스포츠',
  '게임',
  '기타',
] as const

export const STATUSES = ['판매중', '예약중', '거래완료'] as const

export type ProductState = {
  error?: string
} | undefined
