/* 视频章节跳转。
 * 先用浏览器原生跳转（Cloudflare Pages 支持按段加载视频，秒开）；
 * 只有原生跳转失败时，才退回到“先整段缓存再跳转”的兼容方式。 */
(() => {
  const pending = new WeakMap();
  const mediaCache = new Map();

  function status(video, message) {
    let node = video.parentElement.querySelector(".video-seek-status");
    if (!node) {
      node = document.createElement("p");
      node.className = "video-seek-status";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      video.insertAdjacentElement("afterend", node);
    }
    node.textContent = message;
    node.hidden = !message;
  }

  function sourceOf(video) {
    const s =
      video.dataset.originalVideoSource ||
      video.getAttribute("src") ||
      video.querySelector("source[src]")?.getAttribute("src");
    return s && !s.startsWith("blob:") ? new URL(s, document.baseURI).href : video.dataset.originalVideoSource;
  }

  function whenMetadata(video) {
    if (video.readyState >= 1 && Number.isFinite(video.duration)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const ok = () => (off(), resolve());
      const bad = () => (off(), reject(new Error("load")));
      const off = () => {
        video.removeEventListener("loadedmetadata", ok);
        video.removeEventListener("error", bad);
      };
      video.addEventListener("loadedmetadata", ok);
      video.addEventListener("error", bad);
      if (video.networkState === 0 || video.preload === "none") {
        video.preload = "metadata";
        video.load();
      }
    });
  }

  function nativeSeek(video, target) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => finish(false), 8000);
      const finish = (ok) => {
        clearTimeout(timer);
        video.removeEventListener("seeked", onSeeked);
        resolve(ok);
      };
      const onSeeked = () => finish(Math.abs(video.currentTime - target) < 1.5);
      video.addEventListener("seeked", onSeeked);
      video.currentTime = target;
    });
  }

  function cachedMedia(source, progress) {
    let entry = mediaCache.get(source);
    if (!entry) {
      entry = { listeners: new Set(), message: "正在准备视频，首次定位需要缓存…" };
      mediaCache.set(source, entry);
      entry.promise = (async () => {
        const response = await fetch(source);
        if (!response.ok) throw new Error("Video HTTP " + response.status);
        const total = Number(response.headers.get("content-length"));
        const chunks = [];
        let received = 0;
        const reader = response.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.byteLength;
          entry.message = total
            ? `正在准备视频 ${Math.min(100, Math.floor((received / total) * 100))}%…`
            : `正在准备视频 ${(received / 1048576).toFixed(1)} MB…`;
          entry.listeners.forEach((fn) => fn(entry.message));
        }
        entry.url = URL.createObjectURL(
          new Blob(chunks, { type: response.headers.get("content-type") || "video/mp4" }),
        );
        return entry.url;
      })().catch((error) => {
        mediaCache.delete(source);
        throw error;
      });
    }
    entry.listeners.add(progress);
    progress(entry.url ? "正在定位…" : entry.message);
    return entry.promise.finally(() => entry.listeners.delete(progress));
  }

  window.requestTutorialSeek = async function (video, seconds, shouldPlay = true) {
    if (!video || !Number.isFinite(Number(seconds))) return;
    const token = {};
    pending.set(video, token);
    const current = () => pending.get(video) === token && video.isConnected;
    const source = sourceOf(video);
    if (source) video.dataset.originalVideoSource = source;

    try {
      await whenMetadata(video);
    } catch {
      if (current()) status(video, "视频加载失败，请刷新页面或点“单独打开视频”。");
      return;
    }
    if (!current()) return;
    const target = Math.min(Math.max(0, Number(seconds)), Math.max(0, video.duration - 0.05));

    let ok = await nativeSeek(video, target);
    if (!current()) return;

    if (!ok && source && /^https?:/.test(source)) {
      try {
        const url = await cachedMedia(source, (m) => current() && status(video, m));
        if (!current()) return;
        video.src = url;
        await whenMetadata(video);
        ok = await nativeSeek(video, target);
      } catch {
        /* fall through to the message below */
      }
    }
    if (!current()) return;
    if (!ok) {
      status(video, "定位没有成功，请拖动进度条到对应时间。");
      return;
    }
    status(video, "");
    if (shouldPlay) video.play().catch(() => current() && status(video, "已定位，点击播放器的播放按钮继续。"));
  };
})();
