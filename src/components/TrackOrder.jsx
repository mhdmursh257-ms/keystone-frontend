import React, { useState } from 'react';
import axios from 'axios';

const TrackOrder = () => {
  const [token, setToken] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setOrderDetails(null);

    try {
      const response = await axios.get(`http://localhost:5500/api/work-orders/track/${token}`);
      setOrderDetails(response.data);
    } catch (err) {
      setError('Invalid Tracking Token or Work Order not found.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
        <h3 className="text-xl font-bold text-slate-100 mb-6 text-center">Track Work Order</h3>
        
        <form onSubmit={handleTrack} className="space-y-4">
          <input 
            type="text" 
            placeholder="Enter Tracking Token" 
            value={token} 
            onChange={(e) => setToken(e.target.value)} 
            required 
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
            Track Status
          </button>
        </form>

        {error && <p className="mt-4 text-xs text-rose-400 text-center">{error}</p>}

        {orderDetails && (
          <div className="mt-6 p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-2">
            <div className="text-xs text-slate-400">Order Status</div>
            <div className="text-lg font-bold text-indigo-400">{orderDetails.status}</div>
            <div className="text-sm font-semibold text-slate-200">{orderDetails.title}</div>
            <div className="text-xs text-slate-400">{orderDetails.description}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;