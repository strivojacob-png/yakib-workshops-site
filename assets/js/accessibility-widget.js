(function () {
  const STORAGE_KEY = "yakiAccessibilitySettings";
  const root = document.documentElement;
  const defaults = {
    text: "normal",
    highContrast: false,
    darkMode: false,
    highlightLinks: false,
    readableFont: false
  };

  function loadSettings() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch (error) {
      return { ...defaults };
    }
  }

  let settings = loadSettings();

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function applySettings() {
    root.dataset.accessibilityText = settings.text;
    root.classList.toggle("accessibility-high-contrast", settings.highContrast);
    root.classList.toggle("accessibility-dark-mode", settings.darkMode);
    root.classList.toggle("accessibility-highlight-links", settings.highlightLinks);
    root.classList.toggle("accessibility-readable-font", settings.readableFont);

    document.querySelectorAll("[data-accessibility-toggle]").forEach((button) => {
      const key = button.dataset.accessibilityToggle;
      button.setAttribute("aria-pressed", String(Boolean(settings[key])));
    });
  }

  function setTextSize(direction) {
    if (direction === "increase") {
      settings.text = settings.text === "large" ? "large" : "large";
    }

    if (direction === "decrease") {
      settings.text = settings.text === "small" ? "small" : "small";
    }

    saveSettings();
    applySettings();
  }

  function resetSettings() {
    settings = { ...defaults };
    saveSettings();
    applySettings();
  }

  function createWidget() {
    if (document.querySelector(".accessibility-widget")) return;

    const widget = document.createElement("aside");
    widget.className = "accessibility-widget";
    widget.setAttribute("aria-label", "תפריט נגישות");
    widget.innerHTML = `
      <button class="accessibility-toggle" type="button" aria-label="פתיחת תפריט נגישות" aria-expanded="false" aria-controls="accessibility-panel">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 12 2Zm8.2 6.1a1.1 1.1 0 0 1-.9 1.3l-4.3.8v3.2l2.3 6.8a1.2 1.2 0 0 1-2.3.8L12.9 15h-1.8L9 21a1.2 1.2 0 0 1-2.3-.8L9 13.4v-3.2l-4.3-.8a1.1 1.1 0 0 1 .4-2.2l5.2.9h3.4l5.2-.9a1.1 1.1 0 0 1 1.3.9Z"/>
        </svg>
      </button>
      <div class="accessibility-panel" id="accessibility-panel" role="dialog" aria-modal="false" aria-labelledby="accessibility-title" hidden>
        <h2 id="accessibility-title">אפשרויות נגישות</h2>
        <p>התאמות תצוגה מקומיות לנוחות קריאה ושימוש באתר.</p>
        <div class="accessibility-actions">
          <button type="button" data-accessibility-text="increase">הגדלת טקסט <span aria-hidden="true">A+</span></button>
          <button type="button" data-accessibility-text="decrease">הקטנת טקסט <span aria-hidden="true">A-</span></button>
          <button type="button" data-accessibility-toggle="highContrast" aria-pressed="false">ניגודיות גבוהה</button>
          <button type="button" data-accessibility-toggle="darkMode" aria-pressed="false">מצב כהה / בהיר</button>
          <button type="button" data-accessibility-toggle="highlightLinks" aria-pressed="false">הדגשת קישורים</button>
          <button type="button" data-accessibility-toggle="readableFont" aria-pressed="false">פונט קריא</button>
          <button class="accessibility-reset" type="button" data-accessibility-reset>איפוס כל ההגדרות</button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    const toggle = widget.querySelector(".accessibility-toggle");
    const panel = widget.querySelector(".accessibility-panel");

    function setOpen(isOpen) {
      widget.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      panel.hidden = !isOpen;
      if (isOpen) {
        const firstAction = panel.querySelector("button");
        if (firstAction) firstAction.focus();
      }
    }

    toggle.addEventListener("click", () => {
      setOpen(!widget.classList.contains("is-open"));
    });

    widget.querySelectorAll("[data-accessibility-text]").forEach((button) => {
      button.addEventListener("click", () => setTextSize(button.dataset.accessibilityText));
    });

    widget.querySelectorAll("[data-accessibility-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.accessibilityToggle;
        settings[key] = !settings[key];
        saveSettings();
        applySettings();
      });
    });

    widget.querySelector("[data-accessibility-reset]").addEventListener("click", resetSettings);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && widget.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!widget.contains(event.target) && widget.classList.contains("is-open")) {
        setOpen(false);
      }
    });

    applySettings();
  }

  applySettings();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createWidget);
  } else {
    createWidget();
  }
})();
