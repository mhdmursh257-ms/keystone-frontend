import React, { useEffect, useState } from 'react';
import { getAllWorkOrders, updateWorkOrderStatus, assignTechnician, getWorkOrderHistory } from '../services/workOrderService';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const WorkOrderList = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showHistoryModel, setShowHistoryModel] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { isDark, toggleTheme } = useTheme();

  let currentUserRole = 'ADMIN';
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined") {
      const parsedUser = JSON.parse(storedUser);
      currentUserRole = parsedUser?.role || parsedUser?.roles?.[0] || 'ADMIN';
    }
  } catch (e) {
    console.warn("Role check fallback to default ADMIN");
  }

  const isDispatcher = currentUserRole.includes('DISPATCHER') || currentUserRole.includes('ADMIN') || currentUserRole.includes('MANAGER');
  const isTech = currentUserRole.includes('TECHNICIAN') || currentUserRole.includes('ADMIN') || currentUserRole.includes('MANAGER');

  const fetchWorkOrders = () => {
    setLoading(true);
    getAllWorkOrders()
      .then((response) => {
        setWorkOrders(response.data.content || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch Work Orders.');
        toast.error('Failed to fetch Work Orders.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const filteredWorkOrders = workOrders.filter((order) => {
    const matchesSearch = 
      (order.code && order.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.title && order.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    NEW: workOrders.filter(o => o.status === 'NEW').length,
    ASSIGNED: workOrders.filter(o => o.status === 'ASSIGNED').length,
    IN_PROGRESS: workOrders.filter(o => o.status === 'IN_PROGRESS').length,
    ON_HOLD: workOrders.filter(o => o.status === 'ON_HOLD').length,
    COMPLETED: workOrders.filter(o => o.status === 'COMPLETED').length,
    CANCELLED: workOrders.filter(o => o.status === 'CANCELLED').length,
  };

  const chartData = [
    { name: 'NEW', count: statusCounts.NEW, color: '#64748b' },
    { name: 'ASSIGNED', count: statusCounts.ASSIGNED, color: '#06b6d4' },
    { name: 'IN_PROGRESS', count: statusCounts.IN_PROGRESS, color: '#3b82f6' },
    { name: 'ON_HOLD', count: statusCounts.ON_HOLD, color: '#f59e0b' },
    { name: 'COMPLETED', count: statusCounts.COMPLETED, color: '#10b981' },
    { name: 'CANCELLED', count: statusCounts.CANCELLED, color: '#ef4444' },
  ];

  const handleStatusChange = async (order, targetStatus) => {
    let userId = 1; 
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser?.id || 1;
      }
    } catch (e) {
      console.warn("Couldn't parse user from localStorage", e);
    }

    try {
      if (order.status === 'NEW' && targetStatus === 'ASSIGNED') {
        const techId = order.assignedTo?.id || userId;
        await assignTechnician(order.id, techId, userId);
      } else {
        await updateWorkOrderStatus(order.id, targetStatus, userId, `Status changed to ${targetStatus}`);
      }
      
      toast.success(`Status updated to ${targetStatus}!`);
      fetchWorkOrders(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status transition failed!');
    }
  };

  const handleViewHistory = async (orderId) => {
    try {
      setSelectedOrderId(orderId);
      const response = await getWorkOrderHistory(orderId);
      setHistoryLogs(response.data || []);
      setShowHistoryModel(true);
    } catch (err) {
      toast.error('Failed to fetch audit history.');
    }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5500/api/work-orders/${id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `keystone-invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download invoice PDF');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Executive Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Real-time overview & operations control</p>
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-md flex items-center gap-2 text-xs font-semibold cursor-pointer"
        >
          {isDark ? (
            <>
              <span className="text-amber-400 text-base">☀️</span>
            </>
          ) : (
            <>
              <span className="text-indigo-500 text-base">🌙</span>
            </>
          )}
        </button>
      </div>

      {/* Analytics Section */}
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl p-6 rounded-2xl mb-8 shadow-md dark:shadow-xl transition-all">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Work Orders</span>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{workOrders.length}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">In Progress</span>
            <div className="text-3xl font-extrabold text-amber-500 dark:text-amber-400 mt-1">{statusCounts.IN_PROGRESS}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed</span>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{statusCounts.COMPLETED}</div>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} tickLine={false} />
              <YAxis allowDecimals={false} stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                  borderColor: isDark ? '#334155' : '#cbd5e1', 
                  borderRadius: '8px', 
                  color: isDark ? '#f8fafc' : '#0f172a' 
                }}
                cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search by Code or Title..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />

        <select 
          value={statusFilter} 
          onChange={(e) => setSearchFilter(e.target.value)}
          className="bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        >
          <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">All Statuses</option>
          <option value="NEW" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">NEW</option>
          <option value="ASSIGNED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">ASSIGNED</option>
          <option value="IN_PROGRESS" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">IN_PROGRESS</option>
          <option value="ON_HOLD" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">ON_HOLD</option>
          <option value="COMPLETED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">COMPLETED</option>
          <option value="CANCELLED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">CANCELLED</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-md dark:shadow-xl transition-all">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <th className="p-4">ID</th>
              <th className="p-4">Order Details</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Tracking Token</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
            {filteredWorkOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500 dark:text-slate-400">No matching work orders found.</td>
              </tr>
            ) : (
              filteredWorkOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 shadow-sm'>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      {String(order.id)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{order.title}</div>
                    <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{order.code}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                      order.status === 'NEW' ? 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/20' :
                      order.status === 'ASSIGNED' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20' :
                      order.status === 'IN_PROGRESS' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' :
                      order.status === 'ON_HOLD' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                      order.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                      'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400">{order.trackingToken}</td>
                  <td className="p-4 text-right space-x-2">
                    {order.status === 'NEW' && isDispatcher && (
                      <>
                        <button onClick={() => handleStatusChange(order, 'ASSIGNED')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Assign</button>
                        <button onClick={() => handleStatusChange(order, 'CANCELLED')} className="bg-rose-100 hover:bg-rose-600 dark:bg-rose-600/20 text-rose-700 dark:text-rose-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Cancel</button>
                      </>
                    )}

                    {order.status === 'ASSIGNED' && (
                      <>
                        {isTech && <button onClick={() => handleStatusChange(order, 'IN_PROGRESS')} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Start Work</button>}
                        {isDispatcher && <button onClick={() => handleStatusChange(order, 'CANCELLED')} className="bg-rose-100 hover:bg-rose-600 dark:bg-rose-600/20 text-rose-700 dark:text-rose-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Cancel</button>}
                      </>
                    )}

                    {order.status === 'IN_PROGRESS' && isTech && (
                      <>
                        <button onClick={() => handleStatusChange(order, 'ON_HOLD')} className="bg-amber-100 hover:bg-amber-600 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">On Hold</button>
                        <button onClick={() => handleStatusChange(order, 'COMPLETED')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Complete</button>
                      </>
                    )}

                    {order.status === 'ON_HOLD' && isTech && (
                      <button onClick={() => handleStatusChange(order, 'IN_PROGRESS')} className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Resume</button>
                    )}

                    <button onClick={() => handleViewHistory(order.id)} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">History</button>

                    {(order.status === 'COMPLETED' || order.status === 'CLOSED') && (
                      <button onClick={() => handleDownloadInvoice(order.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Invoice</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* History Model */}
      {showHistoryModel && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Audit History - Order #{selectedOrderId}</h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {historyLogs.map((log) => (
                <div key={log.id} className="py-3 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{log.fromStatus || 'N/A'}</span>
                    <span className="mx-2 text-indigo-500">→</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{log.toStatus}</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-500">{new Date(log.changedAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowHistoryModel(false)} className="mt-6 w-full bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-xl text-sm font-semibold transition-all">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderList;