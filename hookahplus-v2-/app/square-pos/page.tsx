import React from 'react';
import GlobalNavigation from '@/components/GlobalNavigation';

const SquarePOSPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 mb-4">Square POS Integration</h1>
          <p className="text-xl text-gray-300">Connect your Square account for seamless order management</p>
        </div>

        {/* Square Connection Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Connection Status</h2>
              <p className="text-gray-400">Manage your Square POS integration</p>
            </div>
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg">
              Connected
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-600 rounded-lg p-6 text-center hover:bg-blue-700 transition-colors cursor-pointer">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Create Order</h3>
            <p className="text-blue-100">Start a new Square order</p>
          </div>
          
          <div className="bg-purple-600 rounded-lg p-6 text-center hover:bg-purple-700 transition-colors cursor-pointer">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Process Payment</h3>
            <p className="text-purple-100">Handle customer payments</p>
          </div>
          
          <div className="bg-green-600 rounded-lg p-6 text-center hover:bg-green-700 transition-colors cursor-pointer">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">View Reports</h3>
            <p className="text-green-100">Sales and analytics</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-300">Order ID</th>
                  <th className="py-3 px-4 text-gray-300">Table</th>
                  <th className="py-3 px-4 text-gray-300">Items</th>
                  <th className="py-3 px-4 text-gray-300">Total</th>
                  <th className="py-3 px-4 text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">SQ_001</td>
                  <td className="py-3 px-4">T-7</td>
                  <td className="py-3 px-4">Hookah Session + Blue Mist</td>
                  <td className="py-3 px-4">$32.00</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">Paid</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">SQ_002</td>
                  <td className="py-3 px-4">Bar-3</td>
                  <td className="py-3 px-4">Premium Hookah</td>
                  <td className="py-3 px-4">$45.00</td>
                  <td className="py-3 px-4">
                    <span className="bg-yellow-600 text-white px-2 py-1 rounded text-sm">Pending</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Square Settings */}
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Square Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">Access Token</label>
              <input 
                type="password" 
                value="••••••••••••••••••••••••••••••••" 
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Location ID</label>
              <input 
                type="text" 
                value="XXXXXXXXXXXX" 
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                readOnly
              />
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Update Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquarePOSPage;
