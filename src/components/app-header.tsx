import Link from "next/link";

export default function AppHeader() {
  return (
    <header
      style={{
        borderBottom: "1px solid #e5e7eb",
        background: "white",
      }}
    >
      <div
        className="container-app"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Link href="/" style={{ fontWeight: 800, fontSize: 18 }}>
          Interior MVP
        </Link>

        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/estimate" className="small-muted">
            견적 시작
          </Link>
          <Link href="/preview" className="small-muted">
            미리보기
          </Link>
          <Link href="/quote" className="small-muted">
            견적서
          </Link>
        </nav>
      </div>
    </header>
  );
}