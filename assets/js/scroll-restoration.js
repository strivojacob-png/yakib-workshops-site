(function () {
  const STORAGE_KEY = "yaki-home-scroll-position";
  const SOURCE_KEY = "yaki-home-scroll-source";
  const HOME_PATHS = new Set(["/", "/index.html"]);
  const RESTORE_DELAYS_MS = [120, 350, 800, 1400, 2200, 3200];

  const normalizePath = (path) => {
    if (!path) return "/";
    return path.endsWith("/") ? "/" : path;
  };

  const isHomepage = () => HOME_PATHS.has(normalizePath(window.location.pathname));

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
  };

  window.saveHomepageScroll = storeHomepageScroll;

  const clearStoredScroll = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SOURCE_KEY);
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

    if (source !== "homepage" || !Number.isFinite(savedPosition)) return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    await waitForImages();

    const applyScroll = () => window.scrollTo(0, savedPosition);
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
      storeHomepageScroll();
      return;
    }

    if (isHomepage() && event.target.closest(".gallery-item, [data-gallery-filter]")) {
      storeHomepageScroll();
    }
  }, true);

  if (document.readyState === "complete") {
    restoreHomepageScroll();
  } else {
    window.addEventListener("load", restoreHomepageScroll, { once: true });
  }
}());
