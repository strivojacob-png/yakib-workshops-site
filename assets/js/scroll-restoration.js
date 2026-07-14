(function () {
  const STORAGE_KEY = "yaki-home-scroll-position";
  const PENDING_KEY = "yaki-home-scroll-pending";
  const RESTORE_DELAYS_MS = [0, 50, 120, 250, 500, 900, 1500, 2500, 4000];
  let scrollSaveTimer = null;
  let restoreRun = 0;
  let restoring = false;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const storeHomepageScroll = () => {
    if (restoring) return;
    sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
  };

  const markHomepageExit = () => {
    sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
    sessionStorage.setItem(PENDING_KEY, "1");
  };

  const restoreHomepageScroll = () => {
    const savedPosition = Number(sessionStorage.getItem(STORAGE_KEY));
    const pendingRestore = sessionStorage.getItem(PENDING_KEY) === "1";

    if (!pendingRestore || !Number.isFinite(savedPosition) || savedPosition < 0) return;

    const currentRun = ++restoreRun;
    restoring = true;

    const applyScroll = (isLastAttempt) => {
      if (currentRun !== restoreRun) return;

      window.scrollTo(0, savedPosition);

      if (isLastAttempt) {
        restoreRun += 1;
        restoring = false;
        sessionStorage.removeItem(PENDING_KEY);
      }
    };

    RESTORE_DELAYS_MS.forEach((delay, index) => {
      window.setTimeout(() => {
        window.requestAnimationFrame(() => {
          applyScroll(index === RESTORE_DELAYS_MS.length - 1);
        });
      }, delay);
    });
  };

  window.addEventListener("scroll", () => {
    if (restoring) return;
    if (scrollSaveTimer) window.clearTimeout(scrollSaveTimer);
    scrollSaveTimer = window.setTimeout(storeHomepageScroll, 120);
  }, { passive: true });

  window.addEventListener("pagehide", markHomepageExit);
  window.addEventListener("pageshow", restoreHomepageScroll);

  ["wheel", "touchstart", "pointerdown", "keydown"].forEach((eventName) => {
    window.addEventListener(eventName, (event) => {
      if (!restoring || !event.isTrusted) return;
      restoreRun += 1;
      restoring = false;
      sessionStorage.removeItem(PENDING_KEY);
    }, { passive: true });
  });
}());
