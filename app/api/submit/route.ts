import { NextResponse } from "next/server";

type QueueItem = { id: string; url: string; submittedAt: string };

function makeId(url: string) {
  // 간단 ID (충돌 확률 낮음)
  return Buffer.from(url).toString("base64").replace(/=+/g, "").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const url = String(body?.url ?? "").trim();
    const inputSecret = String(body?.secret ?? "").trim();

    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "URL이 올바르지 않습니다." }, { status: 400 });
    }

    const envSecret = String(process.env.SUBMIT_SECRET ?? "").trim();
    if (!envSecret) {
      return NextResponse.json(
        { error: "서버에 SUBMIT_SECRET 환경변수가 없습니다. (Vercel 프로젝트 env + Redeploy 확인)" },
        { status: 500 }
      );
    }
    if (inputSecret !== envSecret) {
      return NextResponse.json({ error: "비밀키가 틀렸습니다." }, { status: 401 });
    }

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.DATA_REPO;
    const branch = process.env.DATA_BRANCH || "main";
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      return NextResponse.json({ error: "서버 env 누락(GITHUB_OWNER/DATA_REPO/GITHUB_TOKEN)" }, { status: 500 });
    }

    const path = "data/queue.json";
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`;

    // 1) queue.json 읽기
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "quiet-digest",
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!getRes.ok) {
      const t = await getRes.text();
      return NextResponse.json(
        { error: `queue.json 읽기 실패: ${getRes.status} ${t.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const meta = await getRes.json();
    const sha = meta.sha as string;
    const decoded = Buffer.from(meta.content as string, "base64").toString("utf8");

    let queue: QueueItem[] = [];
    try {
      const parsed = JSON.parse(decoded);
      queue = Array.isArray(parsed) ? parsed : [];
    } catch {
      queue = [];
    }

    // 중복 방지
    const id = makeId(url);
    if (queue.some((q) => q.url === url || q.id === id)) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    queue.unshift({ id, url, submittedAt: new Date().toISOString() });
    queue = queue.slice(0, 200);

    // 2) queue.json 업데이트
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "quiet-digest",
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Enqueue URL (${new Date().toISOString()})`,
        content: Buffer.from(JSON.stringify(queue, null, 2), "utf8").toString("base64"),
        sha,
        branch,
      }),
    });

    if (!putRes.ok) {
      const t = await putRes.text();
      return NextResponse.json(
        { error: `queue.json 업데이트 실패: ${putRes.status} ${t.slice(0, 200)}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}