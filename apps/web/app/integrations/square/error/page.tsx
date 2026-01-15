import Link from "next/link";

export default function SquareErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string; details?: string };
}) {
  const reason = searchParams.reason || "unknown";
  const details = searchParams.details || "";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@hookahplus.com";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Square Connection Failed</h1>
          <p className="text-gray-300 mb-6">
            We couldn’t complete the Square OAuth connection. You can try again, or contact support with the details
            below.
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-200">
          <div>
            <span className="text-gray-400">Reason:</span> <span className="font-mono">{reason}</span>
          </div>
          {details ? (
            <div>
              <span className="text-gray-400">Details:</span> <span className="font-mono">{details}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-6 text-sm text-gray-300">
          Support: <a className="underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            href="/docs"
          >
            Docs
          </Link>
          <Link
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            href="/support"
          >
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}

