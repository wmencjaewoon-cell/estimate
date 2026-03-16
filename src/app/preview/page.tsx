"use client";

import Link from "next/link";
import AppHeader from "../../components/app-header";
import PreviewCard from "../../components/preview-card";
import QuoteSummary from "../../components/quote-summary";
import { useProjectStore } from "../../store/project-store";

export default function PreviewPage() {
  const { selections, address, detailAddress, areaPyeong } = useProjectStore();

  return (
    <>
      <AppHeader />
      <main className="container-app">
        <div className="grid-main">
          <div className="section-gap">
            <div className="card section-gap">
              <span className="badge">3D처럼 보이는 샘플 미리보기</span>
              <h1 className="card-title">선택한 자재가 반영된 공간 예시</h1>
              <p className="small-muted">
                {address} {detailAddress ? `/ ${detailAddress}` : ""} · {areaPyeong}평
              </p>
            </div>

            <PreviewCard selections={selections} />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/estimate" className="btn btn-secondary">
                자재 다시 선택
              </Link>
              <Link href="/quote" className="btn btn-primary">
                견적서 보기
              </Link>
            </div>
          </div>

          <QuoteSummary />
        </div>
      </main>
    </>
  );
}