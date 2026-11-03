"use client";

import { useRouter } from "next/navigation";

export default function EditProfileButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/edit-profile")}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
    >
      ویرایش اطلاعات
    </button>
  );
}
