"use client";

export function ApprovedModal({ open, close }: { open: boolean; close(): void }) {
  if (!open) return null;
  return <div className="modal-backdrop">
    <section className="modal-card">
      <h2>حذف حساب</h2>
      <p>این عملیات قابل بازگشت نیست.</p>
      <button onClick={close}>انصراف</button>
      <button>حذف حساب</button>
    </section>
  </div>;
}
