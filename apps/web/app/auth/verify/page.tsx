import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
        <div className="text-4xl mb-3">📩</div>
        <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
        <p className="text-gray-300 mb-6">We sent a sign-in link. Click it to finish signing in.</p>
        <Link className="text-purple-200 underline" href="/">
          Back to home
        </Link>
      </div>
    </div>
  );
}

