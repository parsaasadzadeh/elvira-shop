import { api } from "./api";

export const authService = {
  sendOtp: async (phone) => {
    return await api.post("/auth/send-otp", { phone });
  },

  verifyOtp: async (phone, code) => {
    return await api.post("/auth/verify-otp", { phone, code });
  },
};
