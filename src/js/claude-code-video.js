/* Claude Code 教程页：6 章视频切换、章内跳转、播完自动下一章。 */
(() => {
  const names = ["先看懂再动手", "环境配置", "登录网页版", "开通 Pro", "绑定 Claude Code", "注意事项"];
  const points = [
    [
      [0, "原理：机场 + 住宅 IP"],
      [13, "开始前备好 3 样"],
      [23, "顺序：一天一步"],
    ],
    [
      [0, "下载、安装 Clash Mi"],
      [16, "登录 Codex、解压配置包"],
      [24, "交给 Codex"],
      [36, "Codex 读包、写配置"],
      [47, "导入、打开连接"],
      [59, "关卡：软件通了再往下"],
      [70, "接上 Claude"],
      [92, "对比：之前 0 分"],
      [98, "验收：IP 检测 + 连接页"],
      [118, "断网测试"],
      [134, "有漏洞怎么办"],
    ],
    [
      [0, "在比特浏览器里登录"],
      [10, "发一句话 = 成功"],
      [14, "第 1 天先用网页版"],
    ],
    [
      [0, "第 2 天再开 Pro"],
      [13, "商城选 Pro"],
      [16, "为什么新手先开 Pro"],
      [33, "看说明、激活"],
      [41, "回 Claude 检查到账"],
    ],
    [
      [0, "第 3 天再绑"],
      [4, "重新登录邮箱"],
      [12, "邮箱里点链接"],
      [16, "点黑色按钮"],
      [21, "Code 页发一句"],
    ],
    [
      [0, "第一：先开 IP 检测"],
      [16, "第二：别马上上 Claude Code"],
      [54, "第三：时区语言关系不大"],
      [79, "卡住了怎么办"],
    ],
  ];
  const poster = (n) => `/assets/img/cc-ch${n}.webp`;
  const clip = (n) => `/assets/video/cc-ch${n}.mp4`;

  const video = document.querySelector("#video video");
  const tabs = [...document.querySelectorAll(".cm-tabs button")];
  const box = document.querySelector("#cm-points");
  if (!video || !box) return;
  const mm = (t) => String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
  let ch = -1;

  function load(n, t, play) {
    if (n !== ch) {
      const first = ch === -1;
      ch = n;
      if (!first) {
        video.poster = poster(n);
        video.src = clip(n);
        delete video.dataset.originalVideoSource;
        video.load();
      }
      document.querySelector("#cm-now").textContent = `第 ${n} 章 · ${names[n]}`;
      document.querySelector("#cm-open").href = clip(n);
      box.innerHTML = points[n]
        .map(
          ([s, l]) => `<button type="button" class="video-chapter" data-time="${s}"><span>${mm(s)}</span>${l}</button>`,
        )
        .join("");
    }
    tabs.forEach((b, i) => {
      b.classList.toggle("current", i === n);
      b.setAttribute("aria-selected", String(i === n));
    });
    if (t != null) window.requestTutorialSeek(video, t, play);
  }

  load(0);
  tabs.forEach((b, i) => b.addEventListener("click", () => load(i, 0, true)));
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-time]");
    if (b) load(ch, Number(b.dataset.time), true);
  });
  document.querySelectorAll(".video-time[data-ch]").forEach((b) =>
    b.addEventListener("click", () => {
      load(Number(b.dataset.ch), Number(b.dataset.time), true);
      document.querySelector("#video").scrollIntoView({ behavior: "smooth", block: "start" });
    }),
  );
  video.addEventListener("timeupdate", () => {
    const cs = [...box.children];
    let cur = cs[0];
    cs.forEach((c) => video.currentTime >= Number(c.dataset.time) && (cur = c));
    cs.forEach((c) => c.classList.toggle("current", c === cur));
  });
  video.addEventListener("ended", () => ch < 5 && load(ch + 1, 0, true));
})();
