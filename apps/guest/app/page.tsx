export default function GuestPortal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Welcome to HookahPlus
        </h1>
        
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Session
          </h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900">Session Active</h3>
              <p className="text-sm text-blue-700">Time remaining: 45 minutes</p>
            </div>
            
            <div className="space-y-2">
              <a 
                href="/extend"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 text-center block"
              >
                Extend Session (+20 min)
              </a>
              
              <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700">
                Request Refill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
