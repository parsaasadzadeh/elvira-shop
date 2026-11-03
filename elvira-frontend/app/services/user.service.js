import { api } from "./api";

const mapUser = (user) => {
  if (!user) return null;

  return {
    id: user._id || user.id,
    name: user.fullName || "",
    fullName: user.fullName || "",
    mobile: user.phone || "",
    phone: user.phone || "",
    role: user.role || "user",
    isProfileCompleted: user.isProfileCompleted || false,

    address: user.address || {},
    addresses: user.address
      ? [
          {
            fullName: user.address.receiverName || user.fullName || "",
            province: user.address.province || "",
            city: user.address.city || "",
            addressLine: user.address.fullAddress || "",
            postalCode: user.address.postalCode || "",
            phone: user.address.receiverPhone || user.phone || "",
            plaque: user.address.plaque || "",
            unit: user.address.unit || "",
            isDefault: true,
          },
        ]
      : [],

    postalCode: user.address?.postalCode || "",
    plaque: user.address?.plaque || "",
    fullAddress: user.address?.fullAddress || "",
    city: user.address?.city || "",
    province: user.address?.province || "",
    receiverName: user.address?.receiverName || "",
    receiverPhone: user.address?.receiverPhone || "",
  };
};

export const userService = {
  getProfile: async () => {
    const res = await api.get("/users/me");
    return mapUser(res.user);
  },

  completeProfile: async (payload) => {
    const body = {
      fullName: payload.fullName,
      address: {
        province: payload.province,
        city: payload.city,
        fullAddress: payload.fullAddress,
        plaque: payload.plaque,
        unit: payload.unit,
        postalCode: payload.postalCode,
        receiverName: payload.receiverName,
        receiverPhone: payload.receiverPhone,
      },
    };

    const res = await api.patch("/users/complete-profile", body);
    return mapUser(res.user);
  },

  updateProfile: async (payload) => {
    const body = {
      ...(payload.fullName !== undefined ? { fullName: payload.fullName } : {}),
      ...(payload.address
        ? { address: payload.address }
        : {
            address: {
              province: payload.province,
              city: payload.city,
              fullAddress: payload.fullAddress,
              plaque: payload.plaque,
              unit: payload.unit,
              postalCode: payload.postalCode,
              receiverName: payload.receiverName,
              receiverPhone: payload.receiverPhone,
            },
          }),
    };

    const res = await api.patch("/users/update-profile", body);
    return mapUser(res.user);
  },
};
