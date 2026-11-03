// app/admin/products/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "../../../components/admin/ProductForm";
import ConfirmModal from "../../../components/admin/ConfirmModal";
import { adminProductService } from "../../../services/admin.product.service";
import { toAbsoluteImageUrl } from "../../../utils/media";

export default function AdminEditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [formKey, setFormKey] = useState(0);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminProductService
      .getById(id)
      .then(setProduct)
      .catch((e) => setLoadError(e?.message || "دریافت محصول ناموفق بود"))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async ({ fields, images }) => {
    const updated = await adminProductService.update(id, fields, images);
    setProduct(updated);
    setFormKey((k) => k + 1); // فرم با داده‌ی تازه‌ی سرور دوباره ساخته شود
    setNotice("تغییرات ذخیره شد.");
  };

  const deleteImage = async (imageUrl) => {
    try {
      const updated = await adminProductService.deleteImage(id, imageUrl);
      setProduct(updated);
      setFormKey((k) => k + 1);
    } catch (e) {
      alert(e?.message || "حذف تصویر ناموفق بود");
    }
  };

  const deleteProduct = async () => {
    setDeleting(true);
    try {
      const res = await adminProductService.delete(id);
      if (res?.archived) alert(res.message);
      router.push("/admin/products");
    } catch (e) {
      alert(e?.message || "حذف محصول ناموفق بود");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <div className="p-6">در حال دریافت محصول...</div>;
  if (loadError) return <div className="p-6 text-red-600 font-bold">{loadError}</div>;
  if (!product) return <div className="p-6">محصول یافت نشد</div>;

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-black">ویرایش محصول</h1>
        <button
          onClick={() => setConfirmDelete(true)}
          className="px-4 py-2 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 transition"
        >
          حذف محصول
        </button>
      </div>

      {!product.isPublished && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-3 text-sm font-bold">
          این محصول منتشر نشده است و در فروشگاه دیده نمی‌شود.
        </div>
      )}
      {notice && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl p-3 text-sm font-bold">{notice}</div>}

      <div className="bg-white border rounded-3xl p-6 shadow-sm mb-6">
        <div className="font-black mb-4">تصاویر محصول</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(product.images || []).map((img) => (
            <div key={img} className="border rounded-2xl overflow-hidden">
              <img src={toAbsoluteImageUrl(img)} className="w-full h-28 object-cover" alt="product" />
              <button
                onClick={() => deleteImage(img)}
                className="w-full py-2 text-sm font-black bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
              >
                حذف تصویر
              </button>
            </div>
          ))}
          {!product.images?.length && <div className="text-gray-500 text-sm">تصویری ثبت نشده است.</div>}
        </div>
      </div>

      <ProductForm key={formKey} initial={product} onSubmit={onSubmit} />

      <ConfirmModal
        open={confirmDelete}
        title="حذف محصول"
        description="اگر این محصول در سفارشی استفاده شده باشد، حذف نمی‌شود و فقط پنهان می‌شود. مطمئنی؟"
        confirmText="حذف"
        loading={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={deleteProduct}
      />
    </div>
  );
}
