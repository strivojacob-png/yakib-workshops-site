(function () {
  const STORAGE_KEY = "yaki-home-scroll-position";
  const SOURCE_KEY = "yaki-home-scroll-source";
  const PENDING_KEY = "yaki-home-scroll-pending";
  const HOME_PATHS = new Set(["/", "/index.html"]);
  const RESTORE_DELAYS_MS = [80, 180, 350, 700, 1200, 2000, 3200];
  let scrollSaveTimer = null;

  const normalizePath = (path) => {
    if (!path) return "/";
    return path.endsWith("/") ? "/" : path;
  };

  const isHomepage = () => HOME_PATHS.has(normalizePath(window.location.pathname));

  if (isHomepage() && "scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const isSamePageHashLink = (url) => (
    url.origin === window.location.origin &&
    normalizePath(url.pathname) === normalizePath(window.location.pathname) &&
    url.hash
  );

  const shouldStoreScrollForLink = (link) => {
    if (!isHomepage()) return false;
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return false;
    if (/^(mailto:|tel:|sms:|javascript:)/i.test(href)) return false;

    const targetUrl = new URL(href, window.location.href);
    if (targetUrl.origin !== window.location.origin) return false;
    if (isSamePageHashLink(targetUrl)) return false;

    return true;
  };

  const storeHomepageScroll = () => {
    sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
    sessionStorage.setItem(SOURCE_KEY, "homepage");
    console.log("[scroll-restoration] saved scroll position", window.scrollY);
  };

  window.saveHomepageScroll = storeHomepageScroll;

  const markHomepageExit = () => {
    if (!isHomepage()) return;
    storeHomepageScroll();
    sessionStorage.setItem(PENDING_KEY, "1");
  };

  const clearStoredScroll = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SOURCE_KEY);
    sessionStorage.removeItem(PENDING_KEY);
  };

  const waitForImages = () => {
    const images = Array.from(document.images).filter((image) => !image.complete);
    if (!images.length) return Promise.resolve();

    return Promise.all(images.map((image) => new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    })));
  };

  const restoreHomepageScroll = async () => {
    if (!isHomepage()) return;

    const savedPosition = Number(sessionStorage.getItem(STORAGE_KEY));
    const source = sessionStorage.getItem(SOURCE_KEY);
    const pendingRestore = sessionStorage.getItem(PENDING_KEY) === "1";

    if (source !== "homepage" || !pendingRestore || !Number.isFinite(savedPosition)) return;

    console.log("[scroll-restoration] detected return to homepage", savedPosition);

    await waitForImages();

    const applyScroll = () => {
      window.scrollTo(0, savedPosition);
      console.log("[scroll-restoration] restored scroll position", window.scrollY);
    };
    applyScroll();
    window.requestAnimationFrame(() => {
      applyScroll();
      window.requestAnimationFrame(applyScroll);
    });
    RESTORE_DELAYS_MS.forEach((delay, index) => {
      window.setTimeout(() => {
        applyScroll();
        if (index === RESTORE_DELAYS_MS.length - 1) {
          clearStoredScroll();
        }
      }, delay);
    });
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (link && shouldStoreScrollForLink(link)) {
      markHomepageExit();
      return;
    }

    if (isHomepage() && event.target.closest(".gallery-item, [data-gallery-filter]")) {
      markHomepageExit();
    }
  }, true);

  window.addEventListener("scroll", () => {
    if (!isHomepage()) return;
    if (scrollSaveTimer) window.clearTimeout(scrollSaveTimer);
    scrollSaveTimer = window.setTimeout(storeHomepageScroll, 120);
  }, { passive: true });

  window.addEventListener("pagehide", markHomepageExit);

  if (document.readyState === "complete") {
    restoreHomepageScroll();
  } else {
    window.addEventListener("load", restoreHomepageScroll, { once: true });
  }

  window.addEventListener("pageshow", restoreHomepageScroll);
}());
