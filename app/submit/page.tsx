"use client";
import { useState } from "react";

export default function SubmitPage() {
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("전송 중...");

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, secret }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(`실패: ${data?.error ?? res.statusText}`);
      return;
    }
    setMsg(`OK: ${data?.skipped ? "이미 있음" : "큐에 추가됨"}`);
    setUrl("");
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <h1>URL 제출</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.fmkorea.com/..."
          required
          style={{ padding: 12, borderRadius: 10, border: "2px solid #333" }}
        />
        <input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="관리자 비밀키(SUBMIT_SECRET)"
          required
          type="password"
          style={{ padding: 12, borderRadius: 10, border: "2px solid #333" }}
        />
        <button type="submit" style={{ padding: 12, borderRadius: 10, border: "2px solid #333" }}>
          제출
        </button>
      </form>

      {msg && <p style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{msg}</p>}
    </main>
  );
}