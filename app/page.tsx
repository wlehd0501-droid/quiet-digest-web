export const dynamic = "force-dynamic";

type Post = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  oneLine: string;
  bullets: string[];
};

async function fetchPosts(): Promise<Post[]> {
  const owner = "wlehd0501-droid";
  const repo = "quiet-digest";
  const branch = "main";
  const path = "data/posts.json";

  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const res = await fetch(rawUrl, { cache: "no-store" });

  if (!res.ok) {
    return [];
  }

  return await res.json();
}

export default async function Home() {
  const posts = await fetchPosts();

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Quiet Digest</h1>
      <p>조용한 요약 피드</p>

      {posts.length === 0 && <p>아직 게시글이 없습니다.</p>}

      {posts.map((post) => (
        <div key={post.id} style={{ border: "1px solid #ccc", padding: 16, marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "#666" }}>
            {post.source} | {post.publishedAt}
          </div>

          <h2>{post.title}</h2>

          <p>{post.oneLine}</p>

          <ul>
            {post.bullets?.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>

          <a href={post.url} target="_blank">
            원문 보기 →
          </a>
        </div>
      ))}
    </main>
  );
}