import { api, toQuery } from "./api";

export const productService = {
  getProducts: async (params = {}) => api.get(`/products${toQuery(params)}`),

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.product;
  },

  getCategories: async () => {
    const res = await api.get("/products/categories");
    return res.categories || [];
  },
};
