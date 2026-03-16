"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppHeader from "../components/app-header";
import { supabase } from "../lib/supabase/client";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      console.log("현재 로그인 유저:", data.user);
      console.log("에러:", error);

      setUser(data.user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      setLoadingLogin(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error(error);
        alert("카카오 로그인 시작에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("카카오 로그인 중 오류가 발생했습니다.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  return (
    <>
      <AppHeader />

      <main className="container-app section-gap">
        <section className="card section-gap">
          <span className="badge">MVP 1단계</span>

          <h1 className="large-title">
            주소, 평형, 자재 선택만으로
            <br />
            예상 견적과 기간을 확인하세요
          </h1>

          <p className="small-muted">
            자재는 Supabase DB에서 직접 불러오고,
            선택 결과를 반영한 샘플 화면과 견적서를 제공합니다.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/estimate" className="btn btn-primary">
              견적 시작하기
            </Link>

            <Link href="/quote" className="btn btn-outline">
              견적서 예시 보기
            </Link>

            <Link href="/admin/materials" className="btn btn-outline">
              자재 등록/관리
            </Link>

            <Link href="/my-quotes" className="btn btn-outline">
              저장된 견적 보기
            </Link>
          </div>

          <div style={{ marginTop: 20 }}>
            {user ? (
              <>
                <p style={{ marginBottom: 10 }}>로그인됨 ✔️</p>
                <button className="btn btn-outline" onClick={handleLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <p style={{ marginBottom: 10 }}>로그인 안됨 ❌</p>
                <button
                  className="btn btn-primary"
                  onClick={handleLogin}
                  disabled={loadingLogin}
                >
                  {loadingLogin ? "이동 중..." : "카카오 로그인"}
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}