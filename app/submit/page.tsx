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

    setMsg("OK: 큐에 추가됨");
    setUrl("");
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>URL 제출</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, color: "#444" }}>URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.fmkorea.com/..."
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "2px solid #333",
              borderRadius: 10,
              fontSize: 16,
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, color: "#444" }}>관리자 비밀키</span>
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="SUBMIT_SECRET"
            required
            type="password"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "2px solid #333",
              borderRadius: 10,
              fontSize: 16,
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "2px solid #333",
            background: "#333",
            color: "white",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          제출
        </button>
      </form>

      {msg && (
        <p style={{ marginTop: 16, padding: 12, background: "#f2f2f2", borderRadius: 10, whiteSpace: "pre-wrap" }}>
          {msg}
        </p>
      )}
    </main>
  );
}