// components/admin/ConfirmModal.jsx
"use client";

export default function ConfirmModal({
  open,
  title = "تأیید",
  description = "مطمئنی؟",
  confirmText = "بله",
  cancelText = "لغو",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow p-6">
        <div className="text-lg font-black text-gray-800">{title}</div>
        <div className="text-sm text-gray-500 mt-2">{description}</div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border font-bold hover:bg-gray-50 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}