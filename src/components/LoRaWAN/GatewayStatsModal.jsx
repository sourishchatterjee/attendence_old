import React, { useState, useEffect } from 'react';
import { lorawanAPI } from '../../services/lorawanAPI';

const GatewayStatsModal = ({ gateway, onClose }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interval, setInterval] = useState('day');
  const [dateRange, setDateRange] = useState({
    from_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchStats();
  }, [interval, dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        interval,
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
      };

      const response = await lorawanAPI.getGatewayStats(gateway.gateway_id, params);
      const statsData = response.data || response || [];
      setStats(Array.isArray(statsData) ? statsData : []);
    } catch (err) {
      console.error('Fetch stats error:', err);
      setError(err.message || 'Failed to fetch statistics');
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateTotals = () => {
    return stats.reduce(
      (acc, stat) => ({
        rx_received: acc.rx_received + (stat.rx_packets_received || 0),
        rx_ok: acc.rx_ok + (stat.rx_packets_received_ok || 0),
        tx_received: acc.tx_received + (stat.tx_packets_received || 0),
        tx_emitted: acc.tx_emitted + (stat.tx_packets_emitted || 0),
        tx_sent: acc.tx_sent + (stat.tx_packets_sent || 0),
      }),
      { rx_received: 0, rx_ok: 0, tx_received: 0, tx_emitted: 0, tx_sent: 0 }
    );
  };

  const totals = calculateTotals();
  const rxSuccessRate = totals.rx_received > 0 ? ((totals.rx_ok / totals.rx_received) * 100).toFixed(1) : 0;
  const txSuccessRate = totals.tx_emitted > 0 ? ((totals.tx_sent / totals.tx_emitted) * 100).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-700">Gateway Statistics</h3>
                <p className="text-sm text-gray-500">{gateway.gateway_name} ({gateway.gateway_eui})</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-700 mb-1">RX Packets</p>
                <p className="text-2xl font-bold text-blue-900">{totals.rx_received.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">{totals.rx_ok.toLocaleString()} OK ({rxSuccessRate}%)</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm text-green-700 mb-1">TX Packets</p>
                <p className="text-2xl font-bold text-green-900">{totals.tx_emitted.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">{totals.tx_sent.toLocaleString()} Sent ({txSuccessRate}%)</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-purple-700 mb-1">RX Success</p>
                <p className="text-2xl font-bold text-purple-900">{rxSuccessRate}%</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-sm text-orange-700 mb-1">TX Success</p>
                <p className="text-2xl font-bold text-orange-900">{txSuccessRate}%</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>

            <input
              type="date"
              value={dateRange.from_date}
              onChange={(e) => setDateRange({ ...dateRange, from_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            />

            <span className="text-gray-600">to</span>

            <input
              type="date"
              value={dateRange.to_date}
              onChange={(e) => setDateRange({ ...dateRange, to_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            />

            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="text-gray-500 ml-3">Loading statistics...</p>
            </div>
          ) : stats.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No statistics available</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting the date range</p>
            </div>
          ) : (
            /* Statistics Table */
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">RX Received</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">RX OK</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">TX Received</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">TX Emitted</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">TX Sent</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Success %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.map((stat) => {
                      const rxSuccess = stat.rx_packets_received > 0 
                        ? ((stat.rx_packets_received_ok / stat.rx_packets_received) * 100).toFixed(1) 
                        : 0;
                      
                      return (
                        <tr key={stat.stat_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(stat.timestamp)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {(stat.rx_packets_received || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                            {(stat.rx_packets_received_ok || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {(stat.tx_packets_received || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {(stat.tx_packets_emitted || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold">
                            {(stat.tx_packets_sent || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              rxSuccess >= 90 ? 'bg-green-100 text-green-800' :
                              rxSuccess >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {rxSuccess}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatewayStatsModal;
