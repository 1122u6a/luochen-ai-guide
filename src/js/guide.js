/* Claude 图文教程页的交互：目录、视频章节、图片放大、问题搜索。正文本身已经写在 HTML 里。 */
(() => {
  const layout = document.querySelector(".guide-layout");
  if (!layout) return;

  /* 目录：桌面端默认展开，手机端默认收起，点选后自动收起 */
  const panel = document.querySelector(".chapter-panel");
  const mobile = matchMedia("(max-width:1000px)");
  const syncPanel = () => panel && (panel.open = !mobile.matches);
  syncPanel();
  mobile.addEventListener("change", syncPanel);

  const tocLinks = [...document.querySelectorAll(".chapter-sidebar a")];
  tocLinks.forEach((a) =>
    a.addEventListener("click", () => {
      if (mobile.matches && panel) panel.open = false;
    }),
  );

  /* 目录高亮：当前读到哪一节 */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        const id = "#" + visible[0].target.id;
        tocLinks.forEach((a) => {
          const on = a.hash === id;
          a.classList.toggle("current", on);
          on ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-18% 0px -55% 0px" },
    );
    tocLinks.forEach((a) => {
      const section = document.querySelector(a.hash);
      if (section) io.observe(section);
    });
  }

  /* 视频章节：点击跳转，播放时高亮当前章节 */
  const videoBox = document.querySelector("#guide-video");
  const video = videoBox?.querySelector("video");
  const chapters = [...document.querySelectorAll("#guide-video .video-chapter")];
  if (video && chapters.length) {
    video.addEventListener("timeupdate", () => {
      let cur = chapters[0];
      chapters.forEach((c) => video.currentTime >= Number(c.dataset.time) && (cur = c));
      chapters.forEach((c) => c.classList.toggle("current", c === cur));
    });
  }
  layout.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-time]");
    if (!btn || !video) return;
    window.requestTutorialSeek(video, Number(btn.dataset.time), true);
    if (!btn.closest("#guide-video")) videoBox.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* 点击截图放大 */
  const dialog = document.querySelector("#guide-image-dialog");
  const dialogContent = document.querySelector("#guide-image-content");
  if (dialog && dialogContent) {
    layout.addEventListener("click", (e) => {
      const btn = e.target.closest(".enlarge-shot");
      if (!btn) return;
      dialogContent.innerHTML = `<div class="enlarged-inner">${btn.innerHTML}</div>`;
      dialogContent.querySelectorAll("img").forEach((img) => img.removeAttribute("loading"));
      dialog.showModal();
    });
    dialog.querySelector(".close-shot")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());
  }

  /* 问题答疑搜索 */
  const input = document.querySelector("#faq-search");
  const items = [...document.querySelectorAll(".faq-item")];
  const count = document.querySelector("#faq-result-count");
  const empty = document.querySelector("#faq-empty");
  if (input && items.length) {
    const texts = items.map((el) => el.textContent.toLocaleLowerCase());
    const filter = () => {
      const term = input.value.trim().toLocaleLowerCase();
      let n = 0;
      items.forEach((el, i) => {
        const match = !term || texts[i].includes(term);
        el.hidden = !match;
        if (match) n++;
      });
      if (count) count.textContent = `找到 ${n} 个问题`;
      if (empty) empty.hidden = n !== 0;
    };
    input.addEventListener("input", filter);
  }
})();
