"use client";

import { useState } from "react";

export default function SubmitPage() {

  const [url, setUrl] = useState("");

  async function submit() {

    await fetch("/api/submit", {

      method: "POST",

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify({

        url: url,

        secret: process.env.NEXT_PUBLIC_SUBMIT_SECRET

      })

    });

    alert("제출됨");

  }

  return (

    <div style={{ padding: 40 }}>

      <h1>URL 제출</h1>

      <input

        value={url}

        onChange={e => setUrl(e.target.value)}

        style={{ width: 400 }}

      />

      <button onClick={submit}>

        제출

      </button>

    </div>

  );

}