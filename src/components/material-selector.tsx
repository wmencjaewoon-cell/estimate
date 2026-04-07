"use client";

import { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "../store/project-store";
import { supabase } from "../lib/supabase/client";
import { formatKRW } from "../lib/utils";

type Props = {
  onComplete: () => void;
  onBack: () => void;
};

type MaterialOption = {
  id: string;
  category: string;
  brand: string;
  productName: string;
  unit: string;
  unitPrice: number;
  shortDesc: string;
  previewStyleKey: string;
};

type StepCategory =
  | "floor"
  | "lighting"
  | "ceiling_fan"
  | "air_conditioner"
  | "wiring_accessory";

const STEP_CONFIG: {
  key: StepCategory;
  title: string;
  categories: string[];
}[] = [
  {
    key: "floor",
    title: "바닥재를 선택해주세요",
    categories: ["flooring", "vinyl_flooring"],
  },
  {
    key: "lighting",
    title: "조명을 선택해주세요",
    categories: ["lighting"],
  },
  {
    key: "ceiling_fan",
    title: "실링팬을 선택해주세요",
    categories: ["ceiling_fan"],
  },
  {
    key: "air_conditioner",
    title: "에어컨을 선택해주세요",
    categories: ["air_conditioner"],
  },
  {
    key: "wiring_accessory",
    title: "배선가구를 선택해주세요",
    categories: ["wiring_accessory"],
  },
];

function getStepLabel(category: string) {
  switch (category) {
    case "flooring":
      return "마루";
    case "vinyl_flooring":
      return "장판";
    case "lighting":
      return "조명";
    case "ceiling_fan":
      return "실링팬";
    case "air_conditioner":
      return "에어컨";
    case "wiring_accessory":
      return "배선가구";
    default:
      return category;
  }
}

function getShortDesc(item: any) {
  const spec = item.spec_json ?? {};

  if (item.category === "flooring") {
    return [
      spec.product_group,
      spec.line_name,
      spec.model_name,
      spec.tone,
      spec.size_mm,
    ]
      .filter(Boolean)
      .join(" / ");
  }

  if (item.category === "vinyl_flooring") {
    return [
      spec.product_name,
      spec.thickness_t ? `${spec.thickness_t}T` : "",
      spec.total_price_pyeong ? `평당 ${Number(spec.total_price_pyeong).toLocaleString()}원` : "",
    ]
      .filter(Boolean)
      .join(" / ");
  }

  if (item.category === "lighting") {
    return [
      spec.light_type,
      spec.model_name,
      spec.watt ? `${spec.watt}W` : "",
      spec.color_temp ? `${spec.color_temp}K` : "",
    ]
      .filter(Boolean)
      .join(" / ");
  }

  if (item.category === "ceiling_fan") {
    return [
      spec.size_inch ? `${spec.size_inch}인치` : "",
      spec.motor_type,
      spec.body_color,
      spec.blade_color,
    ]
      .filter(Boolean)
      .join(" / ");
  }

  if (item.category === "air_conditioner") {
    return [
      spec.ac_type,
      spec.capacity,
      spec.indoor_units ? `실내기 ${spec.indoor_units}` : "",
    ]
      .filter(Boolean)
      .join(" / ");
  }

  if (item.category === "wiring_accessory") {
    return [spec.accessory_type, spec.line_name].filter(Boolean).join(" / ");
  }

  return item.specification || item.note || "";
}

export default function MaterialSelector({ onComplete, onBack }: Props) {
  const store = useProjectStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [materials, setMaterials] = useState<MaterialOption[]>([]);
  const [loading, setLoading] = useState(true);

  const currentStep = STEP_CONFIG[stepIndex];

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("material_master")
        .select("*")
        .eq("is_active", true)
        .in("category", [
          "flooring",
          "vinyl_flooring",
          "lighting",
          "ceiling_fan",
          "air_conditioner",
          "wiring_accessory",
        ])
        .order("category", { ascending: true })
        .order("product_name", { ascending: true });

      if (error) {
        console.error(error);
        setMaterials([]);
        setLoading(false);
        return;
      }

      const mapped: MaterialOption[] = (data || []).map((item: any) => ({
        id: item.id,
        category: item.category,
        brand: item.brand ?? "",
        productName: item.product_name ?? "",
        unit: item.unit ?? "ea",
        unitPrice: Number(item.default_unit_price ?? 0),
        shortDesc: getShortDesc(item),
        previewStyleKey: item.color ?? item.specification ?? "",
      }));

      setMaterials(mapped);
      setLoading(false);
    };

    fetchMaterials();
  }, []);

  const options = useMemo(() => {
    return materials.filter((item) =>
      currentStep.categories.includes(item.category)
    );
  }, [materials, currentStep]);

  const selected = store.selections.find(
    (s: any) => s.roomType === currentStep.key
  );

  const handleSelect = (item: MaterialOption) => {
    store.setSelection({
      roomType: currentStep.key,
      category: currentStep.key as any,
      materialId: item.id,
      productName: item.productName,
      brand: item.brand,
      unit: item.unit,
      unitPrice: item.unitPrice,
      shortDesc: item.shortDesc,
      previewStyleKey: item.previewStyleKey,
    });
  };

  const handleNext = () => {
    if (!selected) {
      alert("하나를 선택해주세요.");
      return;
    }

    if (stepIndex === STEP_CONFIG.length - 1) {
      onComplete();
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (stepIndex === 0) {
      onBack();
      return;
    }
    setStepIndex((prev) => prev - 1);
  };

  return (
    <div className="card section-gap">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 className="card-title">2. 자재를 선택해주세요</h2>
          <p className="small-muted">
            단계 {stepIndex + 1} / {STEP_CONFIG.length}
          </p>
        </div>

        <span className="badge">{currentStep.title}</span>
      </div>

      <div className="card" style={{ background: "#f9fafb" }}>
        <strong>{currentStep.title}</strong>
        <p className="small-muted" style={{ marginTop: 6 }}>
          등록된 자재 목록에서 선택합니다.
        </p>
      </div>

      {loading ? (
        <div className="card">자재를 불러오는 중입니다...</div>
      ) : options.length === 0 ? (
        <div className="card">
          현재 단계에 등록된 자재가 없습니다.
          <br />
          {currentStep.categories.map((cat) => getStepLabel(cat)).join(", ")} 자재를 먼저 등록해주세요.
        </div>
      ) : (
        <div className="section-gap">
          {options.map((item) => {
            const isSelected = selected?.materialId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`option-item ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect(item)}
                style={{
                  textAlign: "left",
                  background: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 700 }}>{item.productName}</div>
                      <span className="badge">{getStepLabel(item.category)}</span>
                    </div>

                    <div className="small-muted" style={{ marginTop: 6 }}>
                      {item.brand || "-"} · {item.shortDesc || "-"}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", minWidth: 120 }}>
                    <div style={{ fontWeight: 800 }}>
                      {formatKRW(item.unitPrice)}
                    </div>
                    <div className="small-muted">/ {item.unit}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button className="btn btn-secondary" onClick={handlePrevStep}>
          이전
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          {stepIndex === STEP_CONFIG.length - 1 ? "완료" : "다음"}
        </button>
      </div>
    </div>
  );
}