import React, { useState } from 'react';
import { createWorkOrder } from '../services/workOrderService';

const CreateWorkOrder = ({ onWorkOrderCreated }) => {
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    priority: 'LOW',
    status: 'NEW',
    slaDueAt: new Date().toISOString().slice(0, 16),
    isSlaBreached: false,
    trackingToken: '',
    customerId: '',
    site: { 
      id: '', 
      name: '', 
      address: '', 
      customerId: '' 
    },
    assignedTo: { 
      id: '', 
      userName: '', 
      userEmail: '', 
      password: '', 
      phone: '', 
      role: 'TECHNICIAN' 
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('site.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        site: { ...prev.site, [field]: (field === 'id' || field === 'customerId') && value !== '' ? Number(value) : value }
      }));
    } else if (name.startsWith('assignedTo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        assignedTo: { ...prev.assignedTo, [field]: field === 'id' && value !== '' ? Number(value) : value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : ((name === 'customerId') && value !== '' ? Number(value) : value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        ...formData,
        customerId: formData.customerId ? Number(formData.customerId) : null,
        slaDueAt: formData.slaDueAt ? new Date(formData.slaDueAt).toISOString() : new Date().toISOString(),
        site: {
          ...formData.site,
          id: formData.site.id ? Number(formData.site.id) : null,
          customerId: formData.site.customerId ? Number(formData.site.customerId) : null,
        },
        assignedTo: {
          ...formData.assignedTo,
          id: formData.assignedTo.id ? Number(formData.assignedTo.id) : null,
        }
      };

      await createWorkOrder(payload);
      setMessage('Work Order created successfully!');
      setLoading(false);
      if (onWorkOrderCreated) onWorkOrderCreated();
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.message || 'Failed to create Work Order.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl dark:shadow-2xl transition-all">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-200 dark:border-slate-700 pb-3">
          Create New Work Order
        </h2>
        
        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-semibold transition-all ${
            message.includes('successfully') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Basic Work Order Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Code</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. WO-1001" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Work order title" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" placeholder="Describe the issue in detail..." className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                  <option value="NEW">NEW</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Customer ID</label>
                <input type="number" name="customerId" value={formData.customerId} onChange={handleChange} placeholder="e.g. 101" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Tracking Token</label>
                <input type="text" name="trackingToken" value={formData.trackingToken} onChange={handleChange} placeholder="e.g. TRK-99201" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">SLA Due At</label>
                <input type="datetime-local" name="slaDueAt" value={formData.slaDueAt} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              {/* SLA Breached Checkbox */}
              <div className="flex items-center gap-3 pt-4">
                <input 
                  type="checkbox" 
                  id="isSlaBreached"
                  name="isSlaBreached" 
                  checked={formData.isSlaBreached} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer" 
                />
                <label htmlFor="isSlaBreached" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer">
                  Is SLA Breached? (Yes / No)
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Site Details */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Site Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Site ID</label>
                <input type="number" name="site.id" value={formData.site.id} onChange={handleChange} placeholder="Site ID" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Site Customer ID</label>
                <input type="number" name="site.customerId" value={formData.site.customerId} onChange={handleChange} placeholder="Site Customer ID" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Site Name</label>
                <input type="text" name="site.name" value={formData.site.name} onChange={handleChange} placeholder="Site Name" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Site Address</label>
                <input type="text" name="site.address" value={formData.site.address} onChange={handleChange} placeholder="Full Address" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Section 3: Assigned Technician */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Assigned Technician Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Tech ID</label>
                <input type="number" name="assignedTo.id" value={formData.assignedTo.id} onChange={handleChange} placeholder="Tech ID" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">User Name</label>
                <input type="text" name="assignedTo.userName" value={formData.assignedTo.userName} onChange={handleChange} placeholder="Tech Name" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" name="assignedTo.userEmail" value={formData.assignedTo.userEmail} onChange={handleChange} placeholder="tech@example.com" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input type="text" name="assignedTo.phone" value={formData.assignedTo.phone} onChange={handleChange} placeholder="Phone Number" className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select name="assignedTo.role" value={formData.assignedTo.role} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="DISPATCHER">DISPATCHER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 cursor-pointer">
            {loading ? 'Submitting...' : 'Submit Work Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkOrder;