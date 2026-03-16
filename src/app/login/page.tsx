"use client";

import { supabase } from "../../lib/supabase/client";

export default function LoginPage() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error(error);
      alert("카카오 로그인 시작 실패");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <button
        style={{
          background: "#FEE500",
          border: "none",
          padding: "14px 24px",
          borderRadius: "8px",
          fontWeight: 700,
          cursor: "pointer",
        }}
        onClick={handleLogin}
      >
        카카오 로그인
      </button>
    </div>
  );
}