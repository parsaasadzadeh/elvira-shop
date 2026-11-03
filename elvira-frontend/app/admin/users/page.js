// app/admin/users/page.js
"use client";

import { useCallback, useEffect, useState } from "react";
import { adminUserService } from "../../services/admin.user.service";
import Pagination from "../../components/admin/Pagination";

const LIMIT = 20;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const me = typeof window !== "undefined" ? (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })() : {};
  const myId = me?.id || me?._id;

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminUserService.getAll({ page, limit: LIMIT, search: search || undefined, role: role || undefined });
      setUsers(res.users);
      setMeta({ page: res.page, pages: res.pages, total: res.total });
    } catch (e) {
      setError(e?.message || "خطا در دریافت کاربران");
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (user, action) => {
    setBusyId(user._id);
    setError("");
    try {
      const updated = await action();
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, ...updated, _id: u._id } : u)));
    } catch (e) {
      setError(e?.message || "عملیات ناموفق بود");
    } finally {
      setBusyId("");
    }
  };

  const toggleRole = (u) => {
    const next = u.role === "admin" ? "user" : "admin";
    const text = next === "admin" ? `«${u.phone}» مدیر سایت شود؟` : `دسترسی مدیریت «${u.phone}» گرفته شود؟`;
    if (!window.confirm(text)) return;
    update(u, () => adminUserService.changeRole(u._id, next));
  };

  const toggleActive = (u) => {
    const next = !u.isActive;
    const text = next ? `حساب «${u.phone}» فعال شود؟` : `حساب «${u.phone}» غیرفعال شود؟ دیگر نمی‌تواند وارد شود.`;
    if (!window.confirm(text)) return;
    update(u, () => adminUserService.setActive(u._id, next));
  };

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-black mb-6">مدیریت کاربران</h1>

      <div className="bg-white border rounded-3xl p-4 mb-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو: نام یا شماره موبایل..."
          className="border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="border rounded-2xl px-4 py-3 bg-white">
          <option value="">همه نقش‌ها</option>
          <option value="user">کاربر</option>
          <option value="admin">مدیر</option>
        </select>
        <div className="text-sm text-gray-500 flex items-center">{meta.total.toLocaleString("fa-IR")} کاربر</div>
      </div>

      {error && <div className="mb-4 text-red-600 font-bold">{error}</div>}

      {loading ? (
        <div className="bg-white border rounded-3xl p-6">در حال دریافت کاربران...</div>
      ) : (
        <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4">نام</th>
                  <th className="p-4">موبایل</th>
                  <th className="p-4">نقش</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">عضویت</th>
                  <th className="p-4">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => {
                  const isMe = String(u._id) === String(myId);
                  return (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="p-4 font-black">{u.fullName || "—"}</td>
                      <td className="p-4" dir="ltr">{u.phone}</td>
                      <td className="p-4 font-bold">{u.role === "admin" ? "مدیر" : "کاربر"}</td>
                      <td className="p-4">
                        {u.isActive ? <span className="text-green-600 font-bold">فعال</span> : <span className="text-red-600 font-bold">غیرفعال</span>}
                      </td>
                      <td className="p-4">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("fa-IR") : "—"}</td>
                      <td className="p-4">
                        {isMe ? (
                          <span className="text-xs text-gray-400">حساب شما</span>
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => toggleRole(u)}
                              disabled={busyId === u._id}
                              className="px-3 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
                            >
                              {u.role === "admin" ? "گرفتن دسترسی مدیر" : "ارتقا به مدیر"}
                            </button>
                            <button
                              onClick={() => toggleActive(u)}
                              disabled={busyId === u._id}
                              className={`px-3 py-2 rounded-xl font-bold transition disabled:opacity-50 ${u.isActive ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"}`}
                            >
                              {u.isActive ? "غیرفعال کردن" : "فعال کردن"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!users.length && (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={6}>کاربری یافت نشد.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
    </div>
  );
}
