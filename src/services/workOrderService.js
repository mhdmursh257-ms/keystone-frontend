import api from '../api/axiosConfig';

export const getAllWorkOrders = (page = 0, size = 10) => {
  return api.get(`/work-orders?page=${page}&size=${size}`);
};

export const createWorkOrder = (workOrderData) => {
  return api.post('/work-orders', workOrderData);
};

export const updateWorkOrderStatus = (id, targetStatus, userId, notes = '') => {
  return api.post(`/work-orders/${id}/status?userId=${userId}`, {
    targetStatus: targetStatus,
    notes: notes,
  });
};

export const assignTechnician = (id, technicianId, dispatcherId) => {
  return api.post(`/work-orders/${id}/assign?dispatcherId=${dispatcherId}`, {
    technicianId: technicianId
  });
};

export const getWorkOrderHistory = (id) => {
  return api.get(`/work-orders/${id}/history`);
};