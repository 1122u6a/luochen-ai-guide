#!/usr/bin/env node
// 洛辰 AI 教程 · 构建脚本（只需要 Node 18+，不用 npm install）
//   node build.mjs          生成 dist/
//   node build.mjs --serve  生成后在 http://localhost:4321 预览
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import http from "node:http";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, "src");
const PUBLIC = path.join(ROOT, "public");
const DIST = path.join(ROOT, "dist");
const config = (await import("./site.config.mjs")).default;
const site = config.siteUrl.replace(/\/$/, "");

const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => (fs.mkdirSync(path.dirname(p), { recursive: true }), fs.writeFileSync(p, s));
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 10);
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// ---------- 1. 清空 dist，复制 public 下的静态文件 ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(PUBLIC, DIST, { recursive: true });

// ---------- 2. CSS / JS 加内容指纹，浏览器可以长期缓存 ----------
const minifyCss = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
const emitted = new Map();
function emit(kind, file) {
  const key = `${kind}/${file}`;
  if (emitted.has(key)) return emitted.get(key);
  let body = read(path.join(SRC, kind, file));
  if (kind === "css") body = minifyCss(body);
  const name = `${path.basename(file, path.extname(file))}.${hash(body)}${path.extname(file)}`;
  write(path.join(DIST, "assets", kind, name), body);
  const url = `/assets/${kind}/${name}`;
  emitted.set(key, url);
  return url;
}

// ---------- 3. 旧的 #/ 网址自动跳到新网址 ----------
const legacyHashRedirect = `<script>(function(){var h=location.hash;if(h.indexOf("#/")!==0)return;var p=h.slice(2).split("/"),t="/";
if(p[0]==="lesson"){t=/^claude/.test(p[1]||"")?"/claude/guide/"+(p[2]==="video"?"#guide-video":p[2]==="text"?"#guide-ready":""):/^(gpt|chatgpt)/.test(p[1]||"")?"/chatgpt/":/^codex/.test(p[1]||"")?"/codex/":"/";}
else if(p[0]==="category"){t={claude:"/claude/",claudecode:"/claude-code/",chatgpt:"/chatgpt/",codex:"/codex/"}[p[1]]||"/";}
else if(p[0]==="toolkit"||p[0]==="tools"){t="/#toolkit";}
location.replace(t);})();</script>
`;

// ---------- 4. 生成每个页面 ----------
const layout = read(path.join(SRC, "layout.html"));
const contactButton = config.contactUrl
  ? `<a class="btn btn-primary-new" href="${attr(config.contactUrl)}" target="_blank" rel="noopener noreferrer">联系我们 →</a>`
  : "";

for (const page of config.pages) {
  let content = read(path.join(SRC, "pages", page.file)).replace("<!--contact-->", contactButton);
  if (page.wrapMain !== false) content = `<main id="main">${content}</main>`;
  else content = content.replace(/<main\b(?![^>]*\bid=)/, '<main id="main"');

  const styles = ["site.css", ...(page.styles || [])].map((f) => `<link rel="stylesheet" href="${emit("css", f)}">`).join("\n");
  const scripts = (page.scripts || []).map((f) => `<script src="${emit("js", f)}" defer></script>`).join("\n");
  const url = site + (page.path.endsWith(".html") ? "/" : page.path);
  const vars = {
    id: page.id,
    title: attr(page.title),
    description: attr(page.description),
    url,
    siteName: config.siteName,
    ogType: page.ogType || "website",
    ogImage: page.og ? `<meta property="og:image" content="${site}${page.og}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n` : "",
    robots: page.noindex ? `<meta name="robots" content="noindex">\n` : "",
    styles,
    head: page.legacyHashRedirect ? legacyHashRedirect : "",
    navHome: page.nav === "home" ? ' class="active" aria-current="page"' : "",
    content,
    footerNote: page.footerNote || "外部资料保留原作者与来源；充值教程由商家实拍。",
    scripts,
  };
  const html = layout.replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in vars)) throw new Error(`layout 里的 {{${k}}} 没有对应的值`);
    return vars[k];
  });
  const out = page.path.endsWith(".html") ? path.join(DIST, page.path) : path.join(DIST, page.path, "index.html");
  write(out, html);
}

// ---------- 5. 站内链接检查：链接到不存在的页面或文件就报错 ----------
const pagePaths = new Set(config.pages.map((p) => p.path));
const problems = [];
for (const page of config.pages) {
  const file = page.path.endsWith(".html") ? path.join(DIST, page.path) : path.join(DIST, page.path, "index.html");
  const html = read(file);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, ref] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(ref)) continue;
    const [p, frag] = ref.split("#");
    if (!p) {
      if (frag && !ids.has(frag)) problems.push(`${page.path}: 找不到锚点 #${frag}`);
      continue;
    }
    if (pagePaths.has(p)) continue;
    if (!fs.existsSync(path.join(DIST, decodeURI(p)))) problems.push(`${page.path}: 找不到 ${p}`);
  }
}
if (problems.length) {
  console.error("\n链接检查没通过：\n  " + problems.join("\n  "));
  process.exit(1);
}

// ---------- 6. sitemap / robots / 缓存规则 / 旧网址跳转 ----------
const today = new Date().toISOString().slice(0, 10);
const indexable = config.pages.filter((p) => !p.noindex);
write(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable
    .map((p) => `  <url><loc>${site}${p.path}</loc><lastmod>${today}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`,
);
write(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
write(
  path.join(DIST, "_headers"),
  `/assets/css/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/js/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/img/*\n  Cache-Control: public, max-age=604800\n/assets/og/*\n  Cache-Control: public, max-age=604800\n/assets/video/*\n  Cache-Control: public, max-age=604800\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`,
);
write(path.join(DIST, "_redirects"), config.redirects.map(([from, to]) => `${from} ${to} 301`).join("\n") + "\n");

// ---------- 7. 汇总 ----------
let files = 0, bytes = 0, largest = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else { files++; const s = fs.statSync(p).size; bytes += s; largest = Math.max(largest, s); }
  }
})(DIST);
console.log(`✓ 已生成 ${config.pages.length} 个页面 → dist/（${files} 个文件，${(bytes / 1048576).toFixed(1)} MB）`);
if (files > 20000 || largest > 25 * 1048576) console.warn("⚠ 超出 Cloudflare Pages 限制：单文件需小于 25 MiB，文件数需少于 20000");

// ---------- 8. 本地预览 ----------
if (process.argv.includes("--serve")) {
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".zip": "application/zip" };
  http
    .createServer((req, res) => {
      let p = decodeURI(new URL(req.url, "http://x").pathname);
      if (p.endsWith("/")) p += "index.html";
      let f = path.join(DIST, p);
      if (!f.startsWith(DIST) || !fs.existsSync(f)) f = path.join(DIST, "404.html");
      const stat = fs.statSync(f);
      const type = types[path.extname(f)] || "application/octet-stream";
      const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
      if (range) {
        const start = Number(range[1] || 0), end = range[2] ? Number(range[2]) : stat.size - 1;
        res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
        fs.createReadStream(f, { start, end }).pipe(res);
      } else {
        res.writeHead(f.endsWith("404.html") && !p.endsWith("404.html") ? 404 : 200, { "Content-Type": type, "Content-Length": stat.size, "Accept-Ranges": "bytes" });
        fs.createReadStream(f).pipe(res);
      }
    })
    .listen(4321, () => console.log("预览：http://localhost:4321"));
}
