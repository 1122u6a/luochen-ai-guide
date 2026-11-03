# 洛辰 AI 教程 · 静态站源码

每篇教程都有自己的网址、标题、描述和分享卡片，正文直接写在 HTML 里，搜索引擎和微信 / QQ 都能读到。

| 网址 | 页面 |
|---|---|
| `/` | 教程中心首页（工具包在 `/#toolkit`） |
| `/claude/` | Claude 教程目录 |
| `/claude/guide/` | Claude 注册、登录与会员充值（完整视频 + 图文） |
| `/claude-code/` | Claude Code 教程目录 |
| `/claude-code/guide/` | Claude Code 完整教程（6 章视频） |
| `/chatgpt/`、`/codex/` | 即将上线（不让搜索引擎收录） |

旧网址都会自动跳到新网址：`/#/lesson/...`、`/#/category/...` 由首页的一小段脚本跳转，`/tutorial-clashmi.html`、旧视频地址等由 `_redirects` 做 301 永久跳转。

## 目录结构

```
site.config.mjs     站点配置：网址、每页标题 / 描述 / 分享图、联系链接、旧网址跳转
build.mjs           构建脚本（只需要 Node 18+，不用 npm install）
src/
  layout.html       所有页面共用的框架：<head>、顶部导航、页脚
  pages/            每个页面的正文（直接改这里的 HTML）
  css/site.css      全站样式
  css/claude-code.css  Claude Code 教程页额外样式
  js/               交互脚本：视频章节跳转、目录高亮、图片放大、问题搜索
public/             原样复制到网站的文件
  assets/img/       截图（WebP）
  assets/og/        分享卡片图（1200×630 JPG）
  assets/video/     视频
  downloads/        配置包等下载文件
  favicon.svg       浏览器标签图标
dist/               构建结果——上传到 Cloudflare Pages 的就是这个文件夹
```

## 日常修改

1. **改文字或截图说明**：直接编辑 `src/pages/` 里对应的 `.html`。
2. **换截图**：把新图转成 WebP 放进 `public/assets/img/`，文件名不变就不用改 HTML。
   （Mac / Linux 转换命令：`cwebp -q 80 原图.png -o public/assets/img/新名字.webp`，或者用任意在线转换工具）
3. **改标题、描述、分享图**：编辑 `site.config.mjs`。
4. **加客服 / 群链接**：在 `site.config.mjs` 里填 `contactUrl`，Claude 教程文末会自动出现“联系我们”按钮。
5. **新增一篇教程**：在 `src/pages/` 新建 `xxx.html`，再在 `site.config.mjs` 的 `pages` 里加一项（复制已有的一项改一改即可）。

改完运行：

```bash
node build.mjs           # 生成 dist/
node build.mjs --serve   # 生成并在 http://localhost:4321 预览
```

构建时会自动检查站内链接，链到不存在的页面、图片或锚点会直接报错并列出位置。

> 交给 Codex / Claude 修改时，可以直接说：“改 src/pages/claude-guide.html 里第 5 步的文字，改完运行 node build.mjs 确认没有报错。”

## 部署到 Cloudflare Pages

**直接上传（和以前一样）**：Workers & Pages → 你的项目 → Create a new deployment → 把 **`dist` 文件夹里的内容**拖进去（`index.html` 必须在最外层，不要多套一层文件夹）。

**接 GitHub 自动部署（推荐，以后改完推送就自动上线）**：把整个源码放到 GitHub 仓库，在 Cloudflare Pages 新建项目时选 *Connect to Git*，构建设置填：

| 项目 | 填写 |
|---|---|
| Framework preset | None |
| Build command | `node build.mjs` |
| Build output directory | `dist` |

## 自动生成的文件

`build.mjs` 每次都会重新生成这些，不需要手动改：

- `sitemap.xml`、`robots.txt`：告诉搜索引擎有哪些页面
- `_headers`：样式、脚本文件名带内容指纹，浏览器缓存一年；图片和视频缓存 7 天
- `_redirects`：旧网址跳转（规则在 `site.config.mjs` 的 `redirects` 里）
- `assets/css/`、`assets/js/`：带指纹的样式和脚本，内容一改文件名就变，用户不会看到旧缓存

## 上线后建议做

- 在 [Google Search Console](https://search.google.com/search-console) 和 [百度搜索资源平台](https://ziyuan.baidu.com/) 提交 `https://你的域名/sitemap.xml`
- 绑定自己的域名后，记得把 `site.config.mjs` 里的 `siteUrl` 改成新域名再构建一次
