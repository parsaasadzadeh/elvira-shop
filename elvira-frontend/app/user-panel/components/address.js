const Address = ({ user }) => {
  const defaultAddress =
    user?.addresses?.find((addr) => addr.isDefault) || user?.addresses?.[0];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <span className="bg-blue-600 w-2 h-6 rounded-full"></span>
          آدرس من
        </h2>
      </div>

      <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <div className="text-gray-700 font-bold mb-2">
          {defaultAddress?.fullName || user?.name || "کاربر"}
        </div>

        <div className="text-gray-600 text-sm leading-8">
          <p>استان: {defaultAddress?.province || "ثبت نشده"}</p>
          <p>شهر: {defaultAddress?.city || "ثبت نشده"}</p>
          <p>آدرس: {defaultAddress?.addressLine || "ثبت نشده"}</p>
          <p>کد پستی: {defaultAddress?.postalCode || "ثبت نشده"}</p>
          <p>پلاک: {defaultAddress?.plaque || "ثبت نشده"}</p>
          <p>واحد: {defaultAddress?.unit || "ثبت نشده"}</p>
          <p dir="ltr">
            شماره موبایل: {defaultAddress?.phone || user?.mobile || "ثبت نشده"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Address;
