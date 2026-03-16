"use client";

import { calculateEstimate } from "../lib/estimate";
import { calculateDurationDays } from "../lib/duration";
import { formatKRW } from "../lib/utils";
import { useProjectStore } from "../store/project-store";

export default function QuoteSummary() {
  const { areaPyeong, scope, selections } = useProjectStore();

  const estimate = calculateEstimate(areaPyeong, selections);
  const durationDays = calculateDurationDays(areaPyeong, scope);

  return (
    <div className="card sticky-box section-gap">
      <h3 className="card-title">예상 요약</h3>

      <div className="summary-list">
        <div className="summary-row">
          <span>선택 자재 수</span>
          <strong>{selections.length}개</strong>
        </div>
        <div className="summary-row">
          <span>예상 자재비</span>
          <strong>{formatKRW(estimate.materialTotal)}</strong>
        </div>
        <div className="summary-row">
          <span>예상 시공비/인건비</span>
          <strong>{formatKRW(estimate.laborTotal)}</strong>
        </div>
        <div className="summary-row">
          <span>철거/기타비용</span>
          <strong>
            {formatKRW(estimate.demolitionTotal + estimate.etcTotal)}
          </strong>
        </div>
        <div className="summary-row">
          <span>예상 공사기간</span>
          <strong>{durationDays}일</strong>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: 12,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 18,
        }}
      >
        <strong>총 예상금액</strong>
        <strong>{formatKRW(estimate.total)}</strong>
      </div>

      <p className="small-muted">
        실제 견적과 기간은 현장 상태, 철거 범위, 추가 공정에 따라 달라질 수
        있습니다.
      </p>
    </div>
  );
}