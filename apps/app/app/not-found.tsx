import Link from 'next/link'
import { Button } from '../components'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            404
          </span>
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-zinc-300">Page Not Found</h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="btn-pretty-primary">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
