"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createMaterial,
  deleteMaterial,
  fetchMaterials,
  getMaterialImageUrl,
  toggleMaterialActive,
  updateMaterial,
  uploadMaterialImage,
} from "@/lib/materials";
import type { Material, MaterialFormInput } from "@/types";

function renderSpecSummary(row: Material) {
  if (!row.spec_json || Object.keys(row.spec_json).length === 0) {
    return "-";
  }

  const s = row.spec_json;

  switch (row.category) {
    case "ceiling_fan":
      return `${s.size_inch || "-"}인치 / ${s.motor_type || "-"} / 바디 ${
        s.body_color || "-"
      } / 날개 ${s.blade_color || "-"} / LED ${
        s.led_kit_available ? "가능" : "불가"
      }`;
    case "air_conditioner":
      return `${s.ac_type || "-"} / ${s.capacity || "-"} / 실내기 ${
        s.indoor_units || "-"
      }`;
    case "flooring":
      return `${s.product_group || "-"} / ${s.line_name || "-"} / ${
        s.model_name || "-"
      } / ${s.thickness_mm || "-"}T / ${s.m2_per_box || "-"}m2 / ${
        s.tone || "-"
      }`;
    case "lighting":
      return `${s.light_type || "-"} / ${s.model_name || "-"} / ${
        s.watt || "-"
      }W / ${s.color_temp || "-"}K / 타공 ${s.cutout_mm || "-"}`;
    case "wiring_accessory":
      return `${s.accessory_type || "-"} / ${s.line_name || "-"}`;
    case "vinyl_flooring":
      return `${s.thickness_t || "-"}T / 자재 ${s.material_price_pyeong || "-"} / 시공 ${
        s.labor_price_pyeong || "-"
      } / 평당 ${s.total_price_pyeong || "-"}`;
    case "wood":
      return `${s.wood_type || "-"} / ${s.thickness_mm || "-"}T / ${
        s.width_mm || "-"
      }x${s.length_mm || "-"} / ${s.price_basis || "-"}`;
    default:
      return Object.entries(s)
        .map(([k, v]) => `${k}:${String(v)}`)
        .join(" / ");
  }
}

const CATEGORY_OPTIONS = [
  { value: "ceiling_fan", label: "실링팬" },
  { value: "air_conditioner", label: "에어컨" },
  { value: "flooring", label: "마루" },
  { value: "lighting", label: "조명" },
  { value: "wiring_accessory", label: "배선가구" },
  { value: "vinyl_flooring", label: "장판" },
  { value: "wood", label: "목재" },
];

function parseMultiValue(input?: string) {
  return (input || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function AdminMaterialsPage() {
  const [rows, setRows] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editing, setEditing] = useState<Material | null>(null);

  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [note, setNote] = useState("");
  const [specJson, setSpecJson] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const [pickedImage, setPickedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await fetchMaterials({ onlyActive: false });
      setRows(data);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "자재 목록 불러오기 실패");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!editing) {
      resetForm();
      return;
    }

    setCategory(editing.category ?? "");
    setBrand(editing.brand ?? "");
    setVendorName(editing.vendor_name ?? "");
    setNote(editing.note ?? "");
    setSpecJson(editing.spec_json ?? {});
    setPickedImage(null);
    setPreviewUrl(getMaterialImageUrl(editing.image_path));
  }, [editing]);

  const categories = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.category).filter(Boolean))).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesCategory = selectedCategory ? row.category === selectedCategory : true;
      const q = keyword.trim().toLowerCase();

      const specText = row.spec_json
        ? Object.entries(row.spec_json)
            .map(([k, v]) => `${k} ${String(v)}`)
            .join(" ")
        : "";

      const matchesKeyword = q
        ? [
            row.category,
            row.brand,
            row.product_name,
            row.specification,
            row.vendor_name,
            row.note,
            specText,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q))
        : true;

      return matchesCategory && matchesKeyword;
    });
  }, [rows, selectedCategory, keyword]);

  function updateSpec(key: string, value: any) {
    setSpecJson((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetForm() {
    setEditing(null);
    setCategory("");
    setBrand("");
    setVendorName("");
    setNote("");
    setSpecJson({});
    setPickedImage(null);
    setPreviewUrl("");
  }

  function handleDuplicate(row: Material) {
    setEditing(null);
    setCategory(row.category ?? "");
    setBrand(row.brand ?? "");
    setVendorName(row.vendor_name ?? "");
    setNote(row.note ?? "");
    setSpecJson({ ...(row.spec_json ?? {}) });
    setPickedImage(null);
    setPreviewUrl(getMaterialImageUrl(row.image_path));
  }

  function buildSingleMaterialInput(
    currentCategory: string,
    currentBrand: string,
    currentVendorName: string,
    currentNote: string,
    currentSpecJson: Record<string, any>,
    currentImagePath?: string,
    currentThumbnailPath?: string
  ): MaterialFormInput {
    let productName = "";
    let specification = "";
    let unit = "ea";
    let defaultUnitPrice = 0;
    let color = "";

    if (currentCategory === "ceiling_fan") {
      productName = currentSpecJson.product_name || "";
      specification = [
        currentSpecJson.size_inch ? `${currentSpecJson.size_inch}인치` : "",
        currentSpecJson.motor_type || "",
        currentSpecJson.house_height_mm
          ? `하우징 ${currentSpecJson.house_height_mm}mm`
          : "",
      ]
        .filter(Boolean)
        .join(" / ");

      unit = "ea";
      defaultUnitPrice = Number(currentSpecJson.unit_price) || 0;
      color = currentSpecJson.body_color || "";
    } else if (currentCategory === "air_conditioner") {
      productName = currentSpecJson.product_name || "";
      specification = `${currentSpecJson.ac_type || ""} / ${currentSpecJson.capacity || ""}`;
      unit = "set";
      defaultUnitPrice = Number(currentSpecJson.unit_price) || 0;
    } else if (currentCategory === "flooring") {
      productName = [
        currentSpecJson.line_name || "",
        currentSpecJson.model_name || "",
        currentSpecJson.tone || "",
      ]
        .join(" ")
        .trim();

      specification = currentSpecJson.size_mm || "";
      unit = "box";
      defaultUnitPrice = Number(currentSpecJson.dealer_price_box) || 0;
      color = currentSpecJson.tone || "";
    } else if (currentCategory === "lighting") {
      productName = [
        currentSpecJson.product_name || "",
        currentSpecJson.model_name || "",
        currentSpecJson.color_temp ? `${currentSpecJson.color_temp}K` : "",
      ]
        .join(" ")
        .trim();

      specification = `${currentSpecJson.watt || ""}W / ${
        currentSpecJson.color_temp || ""
      }K / 타공 ${currentSpecJson.cutout_mm || ""}`;
      unit = "ea";
      defaultUnitPrice = Number(currentSpecJson.unit_price) || 0;
    } else if (currentCategory === "wiring_accessory") {
      productName = currentSpecJson.product_name || "";
      specification = `${currentSpecJson.accessory_type || ""} / ${
        currentSpecJson.line_name || ""
      }`;
      unit = "ea";
      defaultUnitPrice = Number(currentSpecJson.unit_price) || 0;
    } else if (currentCategory === "vinyl_flooring") {
      productName = currentSpecJson.product_name || "";
      specification = `${currentSpecJson.thickness_t || ""}T`;
      unit = "평";
      defaultUnitPrice = Number(currentSpecJson.total_price_pyeong) || 0;
    } else if (currentCategory === "wood") {
      productName = currentSpecJson.product_name || currentSpecJson.wood_type || "";
      specification = `${currentSpecJson.thickness_mm || ""}x${
        currentSpecJson.width_mm || ""
      }x${currentSpecJson.length_mm || ""}`;
      unit = currentSpecJson.price_basis || "장";
      defaultUnitPrice = Number(currentSpecJson.unit_price) || 0;
    }

    return {
      category: currentCategory,
      brand: currentBrand,
      vendor_name: currentVendorName,
      note: currentNote,
      product_name: productName,
      specification,
      color,
      unit,
      default_unit_price: defaultUnitPrice,
      spec_json: currentSpecJson,
      image_path: currentImagePath,
      thumbnail_path: currentThumbnailPath,
    };
  }

  function buildMultipleMaterialInputs(): MaterialFormInput[] {
    if (category === "flooring") {
      const modelNames = parseMultiValue(specJson.model_names);
      const colorNames = parseMultiValue(specJson.color_names);

      const finalModels = modelNames.length ? modelNames : [specJson.model_name || ""];
      const finalColors = colorNames.length ? colorNames : [specJson.tone || ""];

      const results: MaterialFormInput[] = [];

      for (const modelName of finalModels) {
        for (const colorName of finalColors) {
          const {
                model_names,
                color_names,
                ...restSpec
                } = specJson;

                const clonedSpec = {
                ...restSpec,
                model_name: modelName,
                tone: colorName,
                };

          results.push(
            buildSingleMaterialInput(
              category,
              brand,
              vendorName,
              note,
              clonedSpec,
              editing?.image_path || undefined,
              editing?.thumbnail_path || undefined
            )
          );
        }
      }

      return results;
    }

    if (category === "lighting") {
      const modelNames = parseMultiValue(specJson.model_names);
      const colorTemps = parseMultiValue(specJson.color_temp_list);

      const finalModels = modelNames.length ? modelNames : [specJson.model_name || ""];
      const finalTemps = colorTemps.length ? colorTemps : [String(specJson.color_temp || "")];

      const results: MaterialFormInput[] = [];

      for (const modelName of finalModels) {
        for (const temp of finalTemps) {
          const {
            model_names,
            color_temp_list,
            ...restSpec
            } = specJson;

            const clonedSpec = {
            ...restSpec,
            model_name: modelName,
            color_temp: Number(temp) || temp,
            };

          results.push(
            buildSingleMaterialInput(
              category,
              brand,
              vendorName,
              note,
              clonedSpec,
              editing?.image_path || undefined,
              editing?.thumbnail_path || undefined
            )
          );
        }
      }

      return results;
    }

    return [
      buildSingleMaterialInput(
        category,
        brand,
        vendorName,
        note,
        specJson,
        editing?.image_path || undefined,
        editing?.thumbnail_path || undefined
      ),
    ];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!category.trim()) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    try {
      setSaving(true);

      const inputs = buildMultipleMaterialInputs().filter((item) => item.product_name.trim());

      if (inputs.length === 0) {
        alert("상세 입력값을 확인해주세요.");
        return;
      }

      if (editing) {
        const first = inputs[0];
        let saved = await updateMaterial(editing.id, first);

        if (pickedImage) {
          const imagePath = await uploadMaterialImage(pickedImage, saved.id);
          saved = await updateMaterial(saved.id, {
            ...first,
            image_path: imagePath,
            thumbnail_path: imagePath,
          });
        }

        alert("자재가 수정되었습니다.");
      } else {
        for (const input of inputs) {
          let saved = await createMaterial(input);

          if (pickedImage) {
            const imagePath = await uploadMaterialImage(pickedImage, saved.id);
            saved = await updateMaterial(saved.id, {
              ...input,
              image_path: imagePath,
              thumbnail_path: imagePath,
            });
          }
        }

        alert(`${inputs.length}개의 자재가 등록되었습니다.`);
      }

      resetForm();
      await load();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(row: Material) {
    const next = !row.is_active;
    const ok = confirm(next ? "이 자재를 활성화할까요?" : "이 자재를 비활성화할까요?");
    if (!ok) return;

    try {
      await toggleMaterialActive(row.id, next);
      await load();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "상태 변경 실패");
    }
  }

  async function handleDelete(row: Material) {
    const ok = confirm(`"${row.product_name}" 자재를 정말 삭제할까요?`);
    if (!ok) return;

    try {
      await deleteMaterial(row.id);

      if (editing?.id === row.id) {
        resetForm();
      }

      await load();
      alert("자재가 삭제되었습니다.");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "삭제 실패");
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>자재 관리</h1>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{editing ? "자재 수정" : "자재 등록"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <select
              style={styles.input}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSpecJson({});
              }}
            >
              <option value="">카테고리 선택</option>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <input
              style={styles.input}
              placeholder="브랜드"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="거래처명"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 700 }}>자재 이미지</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setPickedImage(file);

                if (file) {
                  const localUrl = URL.createObjectURL(file);
                  setPreviewUrl(localUrl);
                }
              }}
            />

            {previewUrl ? (
              <img src={previewUrl} alt="미리보기" style={styles.previewImage} />
            ) : null}
          </div>

          {category === "ceiling_fan" && (
            <div style={styles.grid}>
              <input
                style={styles.input}
                placeholder="제품명"
                value={specJson.product_name ?? ""}
                onChange={(e) => updateSpec("product_name", e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="인치"
                value={specJson.size_inch ?? ""}
                onChange={(e) => updateSpec("size_inch", Number(e.target.value) || 0)}
              />
              <input
                style={styles.input}
                placeholder="모터 방식 (DC/AC)"
                value={specJson.motor_type ?? ""}
                onChange={(e) => updateSpec("motor_type", e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="기본 단가"
                value={specJson.unit_price ?? ""}
                onChange={(e) => updateSpec("unit_price", Number(e.target.value) || 0)}
              />
              <input
                style={styles.input}
                placeholder="기본 하우징 높이(mm)"
                value={specJson.house_height_mm ?? ""}
                onChange={(e) => updateSpec("house_height_mm", Number(e.target.value) || 0)}
              />
              <input
                style={styles.input}
                placeholder="기본 바디 색상"
                value={specJson.body_color ?? ""}
                onChange={(e) => updateSpec("body_color", e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="바디 추가 색상 목록 (예: 화이트, 블랙, 브론즈)"
                value={specJson.body_color_options ?? ""}
                onChange={(e) => updateSpec("body_color_options", e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="기본 날개 색상"
                value={specJson.blade_color ?? ""}
                onChange={(e) => updateSpec("blade_color", e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="날개 추가 색상 목록 (예: 오크, 월넛, 화이트)"
                value={specJson.blade_color_options ?? ""}
                onChange={(e) => updateSpec("blade_color_options", e.target.value)}
              />
              <select
                style={styles.input}
                value={String(specJson.led_kit_available ?? "")}
                onChange={(e) =>
                  updateSpec(
                    "led_kit_available",
                    e.target.value === "true" ? true : e.target.value === "false" ? false : ""
                  )
                }
              >
                <option value="">LED 키트 가능 여부</option>
                <option value="true">가능</option>
                <option value="false">불가</option>
              </select>
              <input
                style={styles.input}
                placeholder="LED 키트 추가금"
                value={specJson.led_kit_price ?? ""}
                onChange={(e) => updateSpec("led_kit_price", Number(e.target.value) || 0)}
              />
              <input
                style={styles.input}
                placeholder="하우징 높이 옵션 목록 (예: 300, 600, 900)"
                value={specJson.house_height_options ?? ""}
                onChange={(e) => updateSpec("house_height_options", e.target.value)}
              />
              <select
                style={styles.input}
                value={String(specJson.remote_included ?? "")}
                onChange={(e) =>
                  updateSpec(
                    "remote_included",
                    e.target.value === "true" ? true : e.target.value === "false" ? false : ""
                  )
                }
              >
                <option value="">리모컨 포함 여부</option>
                <option value="true">포함</option>
                <option value="false">미포함</option>
              </select>
              <input
                style={styles.input}
                placeholder="추가 옵션 설명"
                value={specJson.extra_option_note ?? ""}
                onChange={(e) => updateSpec("extra_option_note", e.target.value)}
              />
            </div>
          )}

          {category === "air_conditioner" && (
            <div style={styles.grid}>
              <input style={styles.input} placeholder="제품명" value={specJson.product_name ?? ""} onChange={(e) => updateSpec("product_name", e.target.value)} />
              <input style={styles.input} placeholder="에어컨 타입" value={specJson.ac_type ?? ""} onChange={(e) => updateSpec("ac_type", e.target.value)} />
              <input style={styles.input} placeholder="평형" value={specJson.capacity ?? ""} onChange={(e) => updateSpec("capacity", e.target.value)} />
              <input style={styles.input} placeholder="실내기 수" value={specJson.indoor_units ?? ""} onChange={(e) => updateSpec("indoor_units", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="세트 단가" value={specJson.unit_price ?? ""} onChange={(e) => updateSpec("unit_price", Number(e.target.value) || 0)} />
            </div>
          )}

          {category === "flooring" && (
            <div style={styles.grid}>
              <input style={styles.input} placeholder="제품군 (예: 강마루)" value={specJson.product_group ?? ""} onChange={(e) => updateSpec("product_group", e.target.value)} />
              <input style={styles.input} placeholder="라인명 (예: 마블러스)" value={specJson.line_name ?? ""} onChange={(e) => updateSpec("line_name", e.target.value)} />
              <input style={styles.input} placeholder="대표 모델명(단일 등록 시)" value={specJson.model_name ?? ""} onChange={(e) => updateSpec("model_name", e.target.value)} />
              <input style={styles.input} placeholder="모델명 목록 (예: ZEN, MUSE, LIVE)" value={specJson.model_names ?? ""} onChange={(e) => updateSpec("model_names", e.target.value)} />
              <input style={styles.input} placeholder="대표 색상/톤(단일 등록 시)" value={specJson.tone ?? ""} onChange={(e) => updateSpec("tone", e.target.value)} />
              <input style={styles.input} placeholder="색상 목록 (예: 오크, 월넛, 애쉬)" value={specJson.color_names ?? ""} onChange={(e) => updateSpec("color_names", e.target.value)} />
              <input style={styles.input} placeholder="두께(mm)" value={specJson.thickness_mm ?? ""} onChange={(e) => updateSpec("thickness_mm", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="규격(mm) 예: 597x597" value={specJson.size_mm ?? ""} onChange={(e) => updateSpec("size_mm", e.target.value)} />
              <input style={styles.input} placeholder="박스당 PCS" value={specJson.pcs_per_box ?? ""} onChange={(e) => updateSpec("pcs_per_box", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="박스당 m2" value={specJson.m2_per_box ?? ""} onChange={(e) => updateSpec("m2_per_box", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="박스당 평" value={specJson.pyeong_per_box ?? ""} onChange={(e) => updateSpec("pyeong_per_box", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="공급가(박스당)" value={specJson.supply_price_box ?? ""} onChange={(e) => updateSpec("supply_price_box", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="대리점단가(박스당)" value={specJson.dealer_price_box ?? ""} onChange={(e) => updateSpec("dealer_price_box", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="마감/특징" value={specJson.finish ?? ""} onChange={(e) => updateSpec("finish", e.target.value)} />
            </div>
          )}

          {category === "lighting" && (
            <div style={styles.grid}>
              <input style={styles.input} placeholder="제품군/품명" value={specJson.product_name ?? ""} onChange={(e) => updateSpec("product_name", e.target.value)} />
              <input style={styles.input} placeholder="조명 종류" value={specJson.light_type ?? ""} onChange={(e) => updateSpec("light_type", e.target.value)} />
              <input style={styles.input} placeholder="대표 모델명(단일 등록 시)" value={specJson.model_name ?? ""} onChange={(e) => updateSpec("model_name", e.target.value)} />
              <input style={styles.input} placeholder="모델명 목록 (예: 1구, 2구, 3구)" value={specJson.model_names ?? ""} onChange={(e) => updateSpec("model_names", e.target.value)} />
              <input style={styles.input} placeholder="와트(W)" value={specJson.watt ?? ""} onChange={(e) => updateSpec("watt", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="대표 색온도(K)" value={specJson.color_temp ?? ""} onChange={(e) => updateSpec("color_temp", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="색온도 목록 (예: 3000, 4000, 6500)" value={specJson.color_temp_list ?? ""} onChange={(e) => updateSpec("color_temp_list", e.target.value)} />
              <input style={styles.input} placeholder="타공(mm)" value={specJson.cutout_mm ?? ""} onChange={(e) => updateSpec("cutout_mm", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="외경(mm)" value={specJson.diameter_mm ?? ""} onChange={(e) => updateSpec("diameter_mm", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="모델코드" value={specJson.model_code ?? ""} onChange={(e) => updateSpec("model_code", e.target.value)} />
              <input style={styles.input} placeholder="개당 단가" value={specJson.unit_price ?? ""} onChange={(e) => updateSpec("unit_price", Number(e.target.value) || 0)} />
            </div>
          )}

          {category === "wiring_accessory" && (
            <div style={styles.grid}>
              <input style={styles.input} placeholder="제품명" value={specJson.product_name ?? ""} onChange={(e) => updateSpec("product_name", e.target.value)} />
              <input style={styles.input} placeholder="배선가구 종류" value={specJson.accessory_type ?? ""} onChange={(e) => updateSpec("accessory_type", e.target.value)} />
              <input style={styles.input} placeholder="라인명" value={specJson.line_name ?? ""} onChange={(e) => updateSpec("line_name", e.target.value)} />
              <input style={styles.input} placeholder="개당 단가" value={specJson.unit_price ?? ""} onChange={(e) => updateSpec("unit_price", Number(e.target.value) || 0)} />
            </div>
          )}

          {category === "vinyl_flooring" && (
            <div style={styles.grid}>
              <input style={styles.input} placeholder="제품명" value={specJson.product_name ?? ""} onChange={(e) => updateSpec("product_name", e.target.value)} />
              <input style={styles.input} placeholder="두께(T)" value={specJson.thickness_t ?? ""} onChange={(e) => updateSpec("thickness_t", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="자재비(평당)" value={specJson.material_price_pyeong ?? ""} onChange={(e) => updateSpec("material_price_pyeong", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="시공비(평당)" value={specJson.labor_price_pyeong ?? ""} onChange={(e) => updateSpec("labor_price_pyeong", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="평당단가" value={specJson.total_price_pyeong ?? ""} onChange={(e) => updateSpec("total_price_pyeong", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="최소 인건비" value={specJson.minimum_labor_cost ?? ""} onChange={(e) => updateSpec("minimum_labor_cost", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="추가비고" value={specJson.note_extra ?? ""} onChange={(e) => updateSpec("note_extra", e.target.value)} />
            </div>
          )}

          {category === "wood" && (
            <div style={styles.grid}>
              <input style={styles.input} placeholder="제품명" value={specJson.product_name ?? ""} onChange={(e) => updateSpec("product_name", e.target.value)} />
              <input style={styles.input} placeholder="수종" value={specJson.wood_type ?? ""} onChange={(e) => updateSpec("wood_type", e.target.value)} />
              <input style={styles.input} placeholder="두께(mm)" value={specJson.thickness_mm ?? ""} onChange={(e) => updateSpec("thickness_mm", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="폭(mm)" value={specJson.width_mm ?? ""} onChange={(e) => updateSpec("width_mm", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="길이(mm)" value={specJson.length_mm ?? ""} onChange={(e) => updateSpec("length_mm", Number(e.target.value) || 0)} />
              <input style={styles.input} placeholder="등급" value={specJson.grade ?? ""} onChange={(e) => updateSpec("grade", e.target.value)} />
              <input style={styles.input} placeholder="가격 기준 (예: 장, 자, m)" value={specJson.price_basis ?? ""} onChange={(e) => updateSpec("price_basis", e.target.value)} />
              <input style={styles.input} placeholder="기준 단가" value={specJson.unit_price ?? ""} onChange={(e) => updateSpec("unit_price", Number(e.target.value) || 0)} />
            </div>
          )}

          <textarea
            style={styles.textarea}
            placeholder="메모"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div style={styles.actions}>
            {editing && (
              <button type="button" style={styles.secondaryBtn} onClick={resetForm}>
                취소
              </button>
            )}
            <button type="submit" style={styles.primaryBtn} disabled={saving}>
              {saving ? "저장 중..." : editing ? "수정 저장" : "등록"}
            </button>
          </div>
        </form>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>저장된 자재 목록</h2>

        <div style={styles.filterRow}>
          <input
            style={styles.input}
            placeholder="제품명, 브랜드, 규격, 상세속성 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select
            style={styles.input}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">전체 카테고리</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button style={styles.refreshBtn} onClick={load}>
            새로고침
          </button>
        </div>

        {loading ? (
          <div>불러오는 중...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>이미지</th>
                  <th style={styles.th}>카테고리</th>
                  <th style={styles.th}>브랜드</th>
                  <th style={styles.th}>제품명</th>
                  <th style={styles.th}>규격</th>
                  <th style={styles.th}>단위</th>
                  <th style={styles.th}>기본단가</th>
                  <th style={styles.th}>상세속성</th>
                  <th style={styles.th}>상태</th>
                  <th style={styles.th}>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td style={styles.td}>
                      {row.image_path ? (
                        <img
                          src={getMaterialImageUrl(row.image_path)}
                          alt={row.product_name}
                          style={styles.tableImage}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={styles.td}>{row.category}</td>
                    <td style={styles.td}>{row.brand || "-"}</td>
                    <td style={styles.td}>{row.product_name}</td>
                    <td style={styles.td}>{row.specification || "-"}</td>
                    <td style={styles.td}>{row.unit}</td>
                    <td style={styles.td}>
                      {(Number(row.default_unit_price) || 0).toLocaleString()} 원
                    </td>
                    <td style={styles.td}>{renderSpecSummary(row)}</td>
                    <td style={styles.td}>{row.is_active ? "활성" : "비활성"}</td>
                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        <button style={styles.smallBtn} onClick={() => setEditing(row)}>
                          수정
                        </button>
                        <button style={styles.smallBtn} onClick={() => handleDuplicate(row)}>
                          복제
                        </button>
                        <button style={styles.smallBtn} onClick={() => handleToggle(row)}>
                          {row.is_active ? "비활성화" : "활성화"}
                        </button>
                        <button
                          style={{ ...styles.smallBtn, borderColor: "#ef4444", color: "#ef4444" }}
                          onClick={() => handleDelete(row)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td style={styles.emptyTd} colSpan={10}>
                      등록된 자재가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: 24,
    display: "grid",
    gap: 20,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
  },
  section: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 20,
    background: "#fff",
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: 20,
    fontWeight: 700,
  },
  form: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    background: "#fff",
    display: "grid",
    gap: 12,
  },
  filterRow: {
    display: "grid",
    gridTemplateColumns: "1fr 220px 120px",
    gap: 12,
    marginBottom: 16,
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
  refreshBtn: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1250,
  },
  th: {
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px 10px",
    fontSize: 14,
    fontWeight: 700,
    background: "#f9fafb",
  },
  td: {
    borderBottom: "1px solid #f3f4f6",
    padding: "12px 10px",
    fontSize: 14,
    verticalAlign: "top",
    lineHeight: 1.5,
  },
  emptyTd: {
    textAlign: "center",
    padding: 24,
    color: "#6b7280",
  },
  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  smallBtn: {
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },
  previewImage: {
    width: 180,
    height: 180,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  },
  tableImage: {
    width: 72,
    height: 72,
    objectFit: "cover",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
  },
};