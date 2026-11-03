// 站点配置：改网址、标题、描述、分享图，都在这里。
// 改完运行 `node build.mjs`，把生成的 dist 文件夹上传到 Cloudflare Pages。

export default {
  // 绑定自己的域名后，把这里改成新域名（不要以 / 结尾）
  siteUrl: "https://luochen-ai-guide.pages.dev",
  siteName: "洛辰 AI 教程",

  // 填入微信 / 客服 / 群链接后，Claude 教程文末“还有问题？”里会出现“联系我们”按钮
  contactUrl: "",

  // 每个页面：
  //   path        网址（以 / 结尾）
  //   file        正文所在文件（src/pages/ 下）
  //   title       浏览器标题 / 搜索结果标题
  //   description 搜索结果摘要 / 分享卡片描述（建议 60–120 字）
  //   og          分享卡片图片（1200×630 JPG 最稳，微信 / QQ 都认）
  //   styles      额外样式（src/css/ 下，site.css 每页都会加载）
  //   scripts     本页脚本（src/js/ 下）
  //   noindex     true = 不让搜索引擎收录（适合“即将上线”的占位页）
  pages: [
    {
      id: "home",
      path: "/",
      file: "home.html",
      title: "洛辰 AI 教程 · Claude、Claude Code 注册登录与充值教程",
      description: "Claude 网页版和 Claude Code 的分步视频与图文教程：住宅 IP 与指纹浏览器配置、环境检测、注册登录、会员充值，以及常见问题答疑。",
      og: "/assets/og/claude-guide.jpg",
      nav: "home",
      legacyHashRedirect: true,
    },
    {
      id: "claude",
      path: "/claude/",
      file: "claude.html",
      title: "Claude 使用教程 · 洛辰 AI 教程",
      description: "Claude 账号准备、网页版使用与会员充值教程目录。",
      og: "/assets/og/claude-guide.jpg",
    },
    {
      id: "claude-guide",
      path: "/claude/guide/",
      file: "claude-guide.html",
      title: "Claude 注册、登录与会员充值教程（完整视频 + 分步图文）· 洛辰 AI 教程",
      description: "10 分钟完整视频 + 15 步截图：购买住宅 IP、配置比特浏览器（内核改 146）、检测 IP 与环境、注册登录 Claude、用微信 / 支付宝开通会员并核对到账。",
      og: "/assets/og/claude-guide.jpg",
      ogType: "article",
      scripts: ["video-seek.js", "guide.js"],
    },
    {
      id: "claude-code",
      path: "/claude-code/",
      file: "claude-code.html",
      title: "Claude Code 使用教程 · 洛辰 AI 教程",
      description: "Claude Code 环境配置、账号登录与实际使用教程目录。",
      og: "/assets/og/claude-code-guide.jpg",
    },
    {
      id: "claude-code-guide",
      path: "/claude-code/guide/",
      file: "claude-code-guide.html",
      wrapMain: false, // 正文文件自带 <main>
      title: "Claude Code 完整教程：固定出口、登录、开 Pro、绑定 · 洛辰 AI 教程",
      description: "6 章视频 + 分步图文：用 Clash Mi 链式代理让 Claude 固定一个出口，交给 Codex 配好；再登录网页版、开通 Pro、绑定 Claude Code。",
      og: "/assets/og/claude-code-guide.jpg",
      ogType: "article",
      styles: ["claude-code.css"],
      scripts: ["video-seek.js", "claude-code-video.js"],
      footerNote: "Clash Mi 为第三方开源软件，安装包来自其官方 GitHub。",
    },
    {
      id: "chatgpt",
      path: "/chatgpt/",
      file: "chatgpt.html",
      title: "ChatGPT 使用教程（即将上线）· 洛辰 AI 教程",
      description: "ChatGPT 账号登录、日常使用与会员充值教程，即将上线。",
      noindex: true,
    },
    {
      id: "codex",
      path: "/codex/",
      file: "codex.html",
      title: "Codex 使用教程（即将上线）· 洛辰 AI 教程",
      description: "Codex 安装登录、使用入门与常见问题教程，即将上线。",
      noindex: true,
    },
    {
      id: "404",
      path: "/404.html",
      file: "404.html",
      title: "页面不存在 · 洛辰 AI 教程",
      description: "你访问的页面不存在或已移动。",
      noindex: true,
    },
  ],

  // 旧网址 → 新网址（301 永久跳转，保住以前分享出去的链接）
  redirects: [
    ["/tutorial-preview", "/"],
    ["/tutorial-preview/", "/"],
    ["/tutorial-preview.html", "/"],
    ["/tutorial-clashmi", "/claude-code/guide/"],
    ["/tutorial-clashmi/", "/claude-code/guide/"],
    ["/tutorial-clashmi.html", "/claude-code/guide/"],
    ["/tutorial-claude-1022.mp4", "/assets/video/claude-1022.mp4"],
    ["/tutorial-cc-ch0.mp4", "/assets/video/cc-ch0.mp4"],
    ["/tutorial-cc-ch1.mp4", "/assets/video/cc-ch1.mp4"],
    ["/tutorial-cc-ch2.mp4", "/assets/video/cc-ch2.mp4"],
    ["/tutorial-cc-ch3.mp4", "/assets/video/cc-ch3.mp4"],
    ["/tutorial-cc-ch4.mp4", "/assets/video/cc-ch4.mp4"],
    ["/tutorial-cc-ch5.mp4", "/assets/video/cc-ch5.mp4"],
    ["/clashmi-config-pack-v0.4.zip", "/downloads/clashmi-config-pack-v0.4.zip"],
  ],
};
