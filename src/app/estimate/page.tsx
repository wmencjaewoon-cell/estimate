"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "../../components/app-header";
import BasicInfoForm from "../../components/basic-info-form";
import MaterialSelector from "../../components/material-selector";
import QuoteSummary from "../../components/quote-summary";

export default function EstimatePage() {
  const [step, setStep] = useState<"basic" | "materials">("basic");
  const router = useRouter();

  return (
    <>
      <AppHeader />
      <main className="container-app">
        <div className="grid-main">
          <div className="section-gap">
            {step === "basic" && <BasicInfoForm onNext={() => setStep("materials")} />}
            {step === "materials" && (
              <MaterialSelector
                onBack={() => setStep("basic")}
                onComplete={() => router.push("/preview")}
              />
            )}
          </div>

          <QuoteSummary />
        </div>
      </main>
    </>
  );
}