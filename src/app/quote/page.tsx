"use client";

import { useState } from "react";
import AppHeader from "../../components/app-header";
import { useProjectStore } from "../../store/project-store";
import { calculateEstimate } from "../../lib/estimate";
import { calculateDurationDays } from "../../lib/duration";
import { formatKRW } from "../../lib/utils";
import { supabase } from "../../lib/supabase/client";

export default function QuotePage() {
  const {
    address,
    detailAddress,
    housingType,
    areaPyeong,
    scope,
    notes,
    selections,
  } = useProjectStore();

  const estimate = calculateEstimate(areaPyeong, selections);
  const durationDays = calculateDurationDays(areaPyeong, scope);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase.from("projects").insert({
        address,
        detail_address: detailAddress,
        housing_type: housingType,
        area_pyeong: areaPyeong,
        scope,
        notes,
        estimated_total: estimate.total,
        estimated_duration_days: durationDays,
        selections_json: selections,
        line_items_json: estimate.lineItems,
      });

      if (error) {
        console.error(error);
        alert("저장에 실패했습니다. Supabase 테이블 구조를 확인해주세요.");
        return;
      }

      alert("견적이 저장되었습니다.");
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AppHeader />
      <main className="container-app section-gap">
        <div className="card section-gap">
          <div>
            <span className="badge">견적서</span>
            <h1 className="card-title" style={{ marginTop: 10 }}>
              인테리어 예상 견적서
            </h1>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <div className="option-item">
              <div className="small-muted">주소</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>
                {address} {detailAddress}
              </div>
            </div>

            <div className="option-item">
              <div className="small-muted">주거형태</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>
                {housingType === "apartment" ? "아파트" : "오피스텔"}
              </div>
            </div>

            <div className="option-item">
              <div className="small-muted">평형</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>
                {areaPyeong}평
              </div>
            </div>

            <div className="option-item">
              <div className="small-muted">예상 공사기간</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>
                {durationDays}일
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">선택 자재 목록</div>
            <div style={{ overflowX: "auto" }}>
              <table className="quote-table">
                <thead>
                  <tr>
                    <th>공간</th>
                    <th>카테고리</th>
                    <th>제품명</th>
                    <th>단위</th>
                    <th>단가</th>
                  </tr>
                </thead>
                <tbody>
                  {selections.map((item) => (
                    <tr key={`${item.roomType}-${item.category}`}>
                      <td>{item.roomType}</td>
                      <td>{item.category}</td>
                      <td>{item.productName}</td>
                      <td>{item.unit}</td>
                      <td>{formatKRW(item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-title">견적 상세</div>
            <div style={{ overflowX: "auto" }}>
              <table className="quote-table">
                <thead>
                  <tr>
                    <th>항목</th>
                    <th>구분</th>
                    <th>수량</th>
                    <th>단위</th>
                    <th>단가</th>
                    <th>금액</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.lineItems.map((item, idx) => (
                    <tr key={`${item.label}-${idx}`}>
                      <td>{item.label}</td>
                      <td>{item.lineType}</td>
                      <td>{Math.round(item.quantity * 100) / 100}</td>
                      <td>{item.unit}</td>
                      <td>{formatKRW(item.unitPrice)}</td>
                      <td>{formatKRW(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="card"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <div className="option-item">
              <div className="small-muted">자재비</div>
              <div style={{ fontWeight: 800, marginTop: 6 }}>
                {formatKRW(estimate.materialTotal)}
              </div>
            </div>

            <div className="option-item">
              <div className="small-muted">시공 인건비</div>
              <div style={{ fontWeight: 800, marginTop: 6 }}>
                {formatKRW(estimate.laborTotal)}
              </div>
            </div>

            <div className="option-item">
              <div className="small-muted">철거/폐기물</div>
              <div style={{ fontWeight: 800, marginTop: 6 }}>
                {formatKRW(estimate.demolitionTotal)}
              </div>
            </div>

            <div className="option-item">
              <div className="small-muted">기타비용</div>
              <div style={{ fontWeight: 800, marginTop: 6 }}>
                {formatKRW(estimate.etcTotal)}
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div className="small-muted">총 예상금액</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>
                {formatKRW(estimate.total)}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                PDF로 저장
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "저장 중..." : "견적서 저장하기"}
              </button>
            </div>
          </div>

          {notes ? (
            <div className="card">
              <div className="card-title">기타사항</div>
              <p>{notes}</p>
            </div>
          ) : null}

          <p className="small-muted">
            본 견적은 선택 자재와 기본 산식 기준의 예상 견적이며, 실제 현장 상태와
            추가 요청사항에 따라 금액과 기간이 달라질 수 있습니다.
          </p>
        </div>
      </main>
    </>
  );
}