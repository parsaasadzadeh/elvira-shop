// app/admin/products/new/page.jsx
"use client";

import { useRouter } from "next/navigation";
import ProductForm from "../../../components/admin/ProductForm";
import { adminProductService } from "../../../services/admin.product.service";

export default function AdminNewProductPage() {
  const router = useRouter();

  // خطاها داخل ProductForm نمایش داده می‌شوند
  const onSubmit = async ({ fields, images }) => {
    const product = await adminProductService.create(fields, images);
    router.push(`/admin/products/${product._id}`);
  };

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-black mb-6">افزودن محصول</h1>
      <ProductForm onSubmit={onSubmit} />
    </div>
  );
}
