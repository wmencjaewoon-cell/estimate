"use client";

import { useEffect, useState } from "react";
import type { Material, MaterialFormInput } from "../types";

type Props = {
  initialValue?: Material | null;
  onSubmit: (input: MaterialFormInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

export default function AdminMaterialForm({
  initialValue,
  onSubmit,
  onCancel,
  submitLabel = "저장",
}: Props) {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [specification, setSpecification] = useState("");
  const [color, setColor] = useState("");
  const [unit, setUnit] = useState("ea");
  const [defaultUnitPrice, setDefaultUnitPrice] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialValue) return;

    setCategory(initialValue.category ?? "");
    setSubcategory(initialValue.subcategory ?? "");
    setBrand(initialValue.brand ?? "");
    setProductName(initialValue.product_name ?? "");
    setSpecification(initialValue.specification ?? "");
    setColor(initialValue.color ?? "");
    setUnit(initialValue.unit ?? "ea");
    setDefaultUnitPrice(String(initialValue.default_unit_price ?? 0));
    setVendorName(initialValue.vendor_name ?? "");
    setNote(initialValue.note ?? "");
  }, [initialValue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!category.trim()) {
      alert("카테고리를 입력해주세요.");
      return;
    }

    if (!productName.trim()) {
      alert("제품명을 입력해주세요.");
      return;
    }

    if (!unit.trim()) {
      alert("단위를 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      await onSubmit({
        category,
        subcategory,
        brand,
        product_name: productName,
        specification,
        color,
        unit,
        default_unit_price: Number(defaultUnitPrice) || 0,
        vendor_name: vendorName,
        note,
      });

      if (!initialValue) {
        setCategory("");
        setSubcategory("");
        setBrand("");
        setProductName("");
        setSpecification("");
        setColor("");
        setUnit("ea");
        setDefaultUnitPrice("");
        setVendorName("");
        setNote("");
      }
    } catch (error: any) {
      alert(error.message || "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.grid}>
        <input
          style={styles.input}
          placeholder="카테고리 예: 도배"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="서브카테고리 예: 실크벽지"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="브랜드 예: LG"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="제품명"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="규격 예: 600x600"
          value={specification}
          onChange={(e) => setSpecification(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="색상"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="단위 예: m2, ea, roll"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="기본단가"
          inputMode="numeric"
          value={defaultUnitPrice}
          onChange={(e) => setDefaultUnitPrice(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="거래처명"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
        />
      </div>

      <textarea
        style={styles.textarea}
        placeholder="메모"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div style={styles.actions}>
        {onCancel && (
          <button type="button" style={styles.secondaryBtn} onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" style={styles.primaryBtn} disabled={saving}>
          {saving ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    background: "#fff",
    display: "grid",
    gap: 12,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  input: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  primaryBtn: {
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    background: "#111827",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "12px 16px",
    background: "#fff",
    color: "#111827",
    fontWeight: 700,
    cursor: "pointer",
  },
};