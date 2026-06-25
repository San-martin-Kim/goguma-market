'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <span className="text-4xl font-bold text-orange-500">🍠 고구마마켓</span>
        </Link>
        <p className="text-gray-500 mt-2 text-sm">우리 동네 중고거래</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8">
        <h1 className="text-xl font-bold text-gray-800 mb-6">회원가입</h1>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              placeholder="닉네임을 입력하세요"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="6자 이상 입력하세요"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400"
            />
          </div>

          {state?.error && (
            <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{state.error}</p>
          )}

          {state?.message && (
            <p className="text-green-600 text-sm bg-green-50 px-4 py-3 rounded-xl">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
          >
            {pending ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">이미 계정이 있으신가요? </span>
          <Link href="/login" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
