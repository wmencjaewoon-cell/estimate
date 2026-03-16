"use client";

import { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "../store/project-store";
import { supabase } from "../lib/supabase/client";
import type { Material, MaterialCategory, RoomType } from "../types";
import { formatKRW } from "../lib/utils";

type Props = {
  onComplete: () => void;
  onBack: () => void;
};

type MaterialOption = {
  id: string;
  category: MaterialCategory;
  roomType: RoomType;
  brand: string;
  productName: string;
  unit: string;
  unitPrice: number;
  shortDesc: string;
  moodTags: string[];
  previewStyleKey: string;
};

const STEP_CONFIG: {
  roomType: RoomType;
  category: MaterialCategory;
  title: string;
}[] = [
  {
    roomType: "living_room",
    category: "floor",
    title: "거실 바닥재를 선택해주세요",
  },
  {
    roomType: "living_room",
    category: "wall",
    title: "거실 벽 마감을 선택해주세요",
  },
  {
    roomType: "kitchen",
    category: "kitchen_top",
    title: "주방 상판을 선택해주세요",
  },
  {
    roomType: "kitchen",
    category: "kitchen_door",
    title: "주방 도어를 선택해주세요",
  },
  {
    roomType: "kitchen",
    category: "kitchen_faucet",
    title: "주방 수전을 선택해주세요",
  },
  {
    roomType: "bathroom",
    category: "bath_tile",
    title: "욕실 타일을 선택해주세요",
  },
  {
    roomType: "bathroom",
    category: "bath_sink",
    title: "욕실 세면대를 선택해주세요",
  },
  {
    roomType: "bathroom",
    category: "bath_shower",
    title: "욕실 샤워수전을 선택해주세요",
  },
  {
    roomType: "living_room",
    category: "lighting",
    title: "조명을 선택해주세요",
  },
];

function resolveRoomType(category: string): RoomType {
  if (
    category === "kitchen_top" ||
    category === "kitchen_door" ||
    category === "kitchen_faucet"
  ) {
    return "kitchen";
  }

  if (
    category === "bath_tile" ||
    category === "bath_sink" ||
    category === "bath_shower"
  ) {
    return "bathroom";
  }

  return "living_room";
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
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setMaterials([]);
        setLoading(false);
        return;
      }

      const mapped: MaterialOption[] = ((data || []) as Material[])
        .filter((item) =>
          [
            "floor",
            "wall",
            "kitchen_top",
            "kitchen_door",
            "kitchen_faucet",
            "bath_tile",
            "bath_sink",
            "bath_shower",
            "lighting",
          ].includes(item.category)
        )
        .map((item) => ({
          id: item.id,
          category: item.category as MaterialCategory,
          roomType: resolveRoomType(item.category),
          brand: item.brand ?? "",
          productName: item.product_name ?? "",
          unit: item.unit ?? "ea",
          unitPrice: Number(item.default_unit_price ?? 0),
          shortDesc: item.note ?? "",
          moodTags: [],
          previewStyleKey: item.specification ?? "",
        }));

      setMaterials(mapped);
      setLoading(false);
    };

    fetchMaterials();
  }, []);

  const options = useMemo(() => {
    return materials.filter(
      (item) =>
        item.roomType === currentStep.roomType &&
        item.category === currentStep.category
    );
  }, [materials, currentStep]);

  const selected = store.selections.find(
    (s) =>
      s.roomType === currentStep.roomType &&
      s.category === currentStep.category
  );

  const handleSelect = (materialId: string) => {
    const found = options.find((o) => o.id === materialId);
    if (!found) return;

    store.setSelection({
      roomType: found.roomType,
      category: found.category,
      materialId: found.id,
      productName: found.productName,
      brand: found.brand,
      unit: found.unit,
      unitPrice: found.unitPrice,
      shortDesc: found.shortDesc,
      previewStyleKey: found.previewStyleKey,
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

        <span className="badge">
          {currentStep.roomType} / {currentStep.category}
        </span>
      </div>

      <div className="card" style={{ background: "#f9fafb" }}>
        <strong>{currentStep.title}</strong>
        <p className="small-muted" style={{ marginTop: 6 }}>
          자재는 Supabase DB에서 직접 불러옵니다.
        </p>
      </div>

      {loading ? (
        <div className="card">자재를 불러오는 중입니다...</div>
      ) : options.length === 0 ? (
        <div className="card">
          현재 단계에 등록된 자재가 없습니다.
          <br />
          Supabase의 material_master 테이블 데이터를 확인해주세요.
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
                onClick={() => handleSelect(item.id)}
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
                    <div style={{ fontWeight: 700 }}>{item.productName}</div>
                    <div className="small-muted" style={{ marginTop: 6 }}>
                      {item.brand} · {item.shortDesc}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginTop: 8,
                      }}
                    >
                      {item.moodTags.map((tag) => (
                        <span key={tag} className="badge">
                          {tag}
                        </span>
                      ))}
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