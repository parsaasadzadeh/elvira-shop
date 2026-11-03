const UserAccount = ({ user }) => {
  return (
    <div>
      <div className="flex justify-end mb-10">
        <h2 className="text-xl font-black text-blue-600 flex items-center gap-3">
          اطلاعات حساب کاربری
          <span className="bg-blue-600 w-2 h-8 rounded-full"></span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div className="space-y-2 text-right">
          <label className="text-gray-800 font-bold pr-1">نام و نام خانوادگی</label>
          <input
            type="text"
            value={user?.name || ""}
            readOnly
            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-gray-500 font-medium outline-none"
          />
        </div>

        <div className="space-y-2 text-right">
          <label className="text-gray-800 font-bold pr-1">شماره موبایل</label>
          <input
            type="text"
            value={user?.mobile || ""}
            readOnly
            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-gray-500 font-medium outline-none"
            dir="ltr"
          />
        </div>

        <div className="space-y-2 text-right">
          <label className="text-gray-800 font-bold pr-1">استان</label>
          <input
            type="text"
            value={user?.province || ""}
            readOnly
            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-gray-500 font-medium outline-none"
          />
        </div>

        <div className="space-y-2 text-right">
          <label className="text-gray-800 font-bold pr-1">شهر</label>
          <input
            type="text"
            value={user?.city || ""}
            readOnly
            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-gray-500 font-medium outline-none"
          />
        </div>

        <div className="space-y-2 text-right">
          <label className="text-gray-800 font-bold pr-1">کد پستی</label>
          <input
            type="text"
            value={user?.postalCode || ""}
            readOnly
            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-gray-500 font-medium outline-none"
          />
        </div>

        <div className="space-y-2 text-right">
          <label className="text-gray-800 font-bold pr-1">پلاک</label>
          <input
            type="text"
            value={user?.plaque || ""}
            readOnly
            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-gray-500 font-medium outline-none"
          />
        </div>

        <div className="space-y-2 text-right md:col-span-2">
          <label className="text-gray-800 font-bold pr-1">آدرس</label>
          <textarea
            value={user?.fullAddress || ""}
            readOnly
            rows={4}
            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-gray-500 font-medium outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
