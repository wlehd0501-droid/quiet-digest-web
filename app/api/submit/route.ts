import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const url = body.url;
    const secret = body.secret;

    if (secret !== process.env.SUBMIT_SECRET) {
      return NextResponse.json(
        { error: "비밀키가 틀림" },
        { status: 401 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { error: "URL 없음" },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.DATA_REPO;

    const path = "data/queue.json";

    const api =
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const get = await fetch(api, {
      headers: {
        Authorization: `token ${token}`
      }
    });

    const data = await get.json();

    const content =
      JSON.parse(
        Buffer.from(
          data.content,
          "base64"
        ).toString()
      );

    content.unshift({
      id: Date.now(),
      url: url
    });

    const encoded =
      Buffer.from(
        JSON.stringify(content, null, 2)
      ).toString("base64");

    await fetch(api, {

      method: "PUT",

      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        message: "add queue",

        content: encoded,

        sha: data.sha

      })

    });

    return NextResponse.json({ ok: true });

  } catch (e: any) {

    return NextResponse.json(
      { error: e.toString() },
      { status: 500 }
    );

  }
}