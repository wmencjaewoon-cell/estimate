"use client";

import { useState } from "react";
import { useProjectStore } from "../store/project-store";
import { ScopeItem, HousingType } from "../types";

type Props = {
  onNext: () => void;
};

const scopeOptions: { value: ScopeItem; label: string }[] = [
  { value: "living_room", label: "거실" },
  { value: "kitchen", label: "주방" },
  { value: "bedroom", label: "방" },
  { value: "bathroom", label: "욕실" },
  { value: "entrance", label: "현관" },
  { value: "balcony", label: "베란다" },
];

export default function BasicInfoForm({ onNext }: Props) {
  const store = useProjectStore();

  const [address, setAddress] = useState(store.address);
  const [detailAddress, setDetailAddress] = useState(store.detailAddress);
  const [housingType, setHousingType] = useState<HousingType>(store.housingType);
  const [areaPyeong, setAreaPyeong] = useState<number>(store.areaPyeong);
  const [scope, setScope] = useState<ScopeItem[]>(store.scope);
  const [notes, setNotes] = useState(store.notes);

  const toggleScope = (value: ScopeItem) => {
    setScope((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleSubmit = () => {
    if (!address.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }

    if (!areaPyeong || areaPyeong <= 0) {
      alert("평형을 입력해주세요.");
      return;
    }

    store.setBasicInfo({
      address,
      detailAddress,
      housingType,
      areaPyeong,
      scope,
      notes,
    });

    onNext();
  };

  return (
    <div className="card section-gap">
      <h2 className="card-title">1. 기본 정보를 입력해주세요</h2>

      <div className="section-gap">
        <div>
          <label className="small-muted">주소</label>
          <input
            className="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="예: 서울시 강남구 대치동 ..."
          />
        </div>

        <div>
          <label className="small-muted">상세주소 (동/호수)</label>
          <input
            className="input"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            placeholder="예: 101동 1203호"
          />
        </div>

        <div>
          <label className="small-muted">주거형태</label>
          <select
            className="select"
            value={housingType}
            onChange={(e) => setHousingType(e.target.value as HousingType)}
          >
            <option value="apartment">아파트</option>
            <option value="officetel">오피스텔</option>
          </select>
        </div>

        <div>
          <label className="small-muted">평형</label>
          <input
            className="input"
            type="number"
            value={areaPyeong}
            onChange={(e) => setAreaPyeong(Number(e.target.value))}
            placeholder="예: 24"
          />
        </div>

        <div>
          <label className="small-muted">인테리어 범위</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 10,
              marginTop: 8,
            }}
          >
            {scopeOptions.map((item) => (
              <label
                key={item.value}
                className="option-item"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <input
                  type="checkbox"
                  checked={scope.includes(item.value)}
                  onChange={() => toggleScope(item.value)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="small-muted">기타사항</label>
          <textarea
            className="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="예: 확장 있음, 철거 포함, 밝은톤 선호"
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={handleSubmit}>
          다음: 자재 선택
        </button>
      </div>
    </div>
  );
}