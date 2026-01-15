import Link from "next/link";

export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  const err = searchParams.error || "unknown";
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Sign-in error</h1>
        <p className="text-gray-300 mb-6">
          We couldn’t complete sign-in. If this keeps happening, contact support with this code:
        </p>
        <div className="font-mono text-sm text-gray-200 bg-white/10 border border-white/20 rounded p-3 mb-6">
          {err}
        </div>
        <div className="flex justify-center gap-4">
          <Link className="text-purple-200 underline" href="/auth/signin">
            Try again
          </Link>
          <Link className="text-purple-200 underline" href="/support">
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}

