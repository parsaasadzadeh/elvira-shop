import { api, toQuery } from "./api";

export const adminUserService = {
  getAll: async (params = {}) => {
    const res = await api.get(`/users${toQuery(params)}`);
    return { users: res.users || [], total: res.total || 0, page: res.page || 1, pages: res.pages || 1 };
  },

  changeRole: async (id, role) => {
    const res = await api.patch(`/users/${id}/role`, { role });
    return res.user;
  },

  setActive: async (id, isActive) => {
    const res = await api.patch(`/users/${id}/active`, { isActive });
    return res.user;
  },
};
