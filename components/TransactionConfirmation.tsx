"use client";

import React, { useState, useEffect } from 'react';

interface TransactionConfirmationProps {
  orderId: string;
  customerName: string;
  tableId: string;
  flavor: string;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deliveryNotes: string) => void;
}

const TransactionConfirmation: React.FC<TransactionConfirmationProps> = ({
  orderId,
  customerName,
  tableId,
  flavor,
  amount,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(2); // minutes
  const [selectedHookahRoom, setSelectedHookahRoom] = useState('main');

  const hookahRooms = [
    { id: 'main', name: 'Main Hookah Room', prepRate: 2 },
    { id: 'bar', name: 'Bar Hookah Station', prepRate: 3 },
    { id: 'vip', name: 'VIP Hookah Room', prepRate: 2 },
    { id: 'outdoor', name: 'Outdoor Hookah Area', prepRate: 4 }
  ];

  useEffect(() => {
    const selectedRoom = hookahRooms.find(room => room.id === selectedHookahRoom);
    if (selectedRoom) {
      setEstimatedDeliveryTime(selectedRoom.prepRate);
    }
  }, [selectedHookahRoom]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-teal-400">Transaction Confirmed! 🎉</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Order Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-400">Order ID:</span>
              <p className="text-white font-mono">{orderId}</p>
            </div>
            <div>
              <span className="text-zinc-400">Customer:</span>
              <p className="text-white">{customerName}</p>
            </div>
            <div>
              <span className="text-zinc-400">Table:</span>
              <p className="text-white">{tableId}</p>
            </div>
            <div>
              <span className="text-zinc-400">Amount:</span>
              <p className="text-white font-bold">${(amount / 100).toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-zinc-400">Flavor:</span>
            <p className="text-white text-lg">{flavor}</p>
          </div>
        </div>

        {/* Delivery Expectations */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">🚀 Delivery Expectations</h4>
          
          <div className="mb-4">
            <label className="block text-zinc-400 mb-2">Hookah Room Location:</label>
            <select 
              value={selectedHookahRoom} 
              onChange={(e) => setSelectedHookahRoom(e.target.value)}
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
            >
              {hookahRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} (Prep: {room.prepRate} min)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{estimatedDeliveryTime}</div>
              <div className="text-zinc-400 text-sm">Prep Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">2-3</div>
              <div className="text-zinc-400 text-sm">Delivery Buffer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{estimatedDeliveryTime + 3}</div>
              <div className="text-zinc-400 text-sm">Total ETA</div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
            <div className="text-blue-300 text-sm">
              <strong>Important:</strong> Customer timer will start 2-3 minutes AFTER delivery confirmation, 
              not when the order is placed. This ensures accurate session timing.
            </div>
          </div>
        </div>

        {/* Delivery Notes */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">📝 Delivery Notes</h4>
          <textarea
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            placeholder="Any special instructions for delivery staff..."
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white h-24 resize-none"
          />
        </div>

        {/* Workflow Steps */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">🔄 Delivery Workflow</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              <div className="text-zinc-300">Hookah room staff receives order</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              <div className="text-zinc-300">Preparation begins (ETA: {estimatedDeliveryTime} min)</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
              <div className="text-zinc-300">Hookah marked "Ready for Pickup"</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
              <div className="text-zinc-300">Front staff delivers to customer</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">5</div>
              <div className="text-zinc-300">Delivery confirmed - Customer timer starts</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onConfirm(deliveryNotes)}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Confirm & Send to Hookah Room
          </button>
        </div>

        {/* Customer Message */}
        <div className="mt-4 text-center">
          <div className="text-zinc-400 text-sm">
            Customer will receive confirmation with estimated delivery time
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionConfirmation;
