import { api } from "./api";

export const settingsService = {
  getPublic: async () => {
    const res = await api.get("/settings");
    return res.settings;
  },
};
