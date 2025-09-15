export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            Hookah<span className="text-purple-300">+</span>
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            The Future of Hookah Lounge Management
          </p>
          <div className="space-x-4">
            <a 
              href="https://app.hookahplus.net" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Operator Dashboard
            </a>
            <a 
              href="https://guest.hookahplus.net" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Guest Portal
            </a>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Timed Sessions</h3>
            <p className="text-gray-300">Automated session management with precise timing controls</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Smart Refills</h3>
            <p className="text-gray-300">Intelligent refill workflow with SLA tracking</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Reservation Holds</h3>
            <p className="text-gray-300">Secure table reservations with payment holds</p>
          </div>
        </div>
      </div>
    </div>
  );
}
