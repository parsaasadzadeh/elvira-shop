import { api } from "./api";

export const paymentService = {
  requestZibal: async (orderId) => {
    const res = await api.post("/payments/zibal/request", { orderId });
    return res; // { paymentUrl, trackId, ... }
  },
};