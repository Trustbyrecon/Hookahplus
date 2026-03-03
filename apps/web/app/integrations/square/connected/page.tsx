import Link from "next/link";

export default function SquareConnectedPage({
  searchParams,
}: {
  searchParams: { loungeId?: string; merchantId?: string; locationId?: string };
}) {
  const loungeId = searchParams.loungeId || "";
  const merchantId = searchParams.merchantId || "";
  const locationId = searchParams.locationId || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
        <div className="text-center">
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">Square Connected</h1>
          <p className="text-gray-300 mb-6">
            Your Square account is connected to Hookah+. Next, run a connection check and close a session to create an
            order in Square.
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-200">
          <div>
            <span className="text-gray-400">loungeId:</span> <span className="font-mono">{loungeId || "(missing)"}</span>
          </div>
          <div>
            <span className="text-gray-400">merchantId:</span>{" "}
            <span className="font-mono">{merchantId || "(missing)"}</span>
          </div>
          <div>
            <span className="text-gray-400">locationId:</span>{" "}
            <span className="font-mono">{locationId || "(missing)"}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {loungeId ? (
            <a
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              href={`/api/integrations/square/connection-check?loungeId=${encodeURIComponent(loungeId)}`}
            >
              Run connection check
            </a>
          ) : null}
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

