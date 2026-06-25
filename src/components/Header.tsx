import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-2xl">🍠</span>
          <span className="font-bold text-orange-500 text-lg">고구마마켓</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.user_metadata?.nickname ?? user.email?.split('@')[0]}
              </span>
              <Link
                href="/sell"
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                판매하기
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
