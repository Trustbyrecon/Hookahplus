'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../components'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Error
          </span>
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-zinc-300">Something went wrong!</h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          An unexpected error occurred. Please try again or return home.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} className="btn-pretty-secondary">
            Try Again
          </Button>
          <Link href="/">
            <Button className="btn-pretty-primary">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
