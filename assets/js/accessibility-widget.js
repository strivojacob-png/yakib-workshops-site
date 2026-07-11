(function () {
  const STORAGE_KEY = "yakiAccessibilitySettings";
  const root = document.documentElement;

  const defaults = {
    textLevel: 0,
    lineSpacing: false,
    letterSpacing: false,
    highContrast: false,
    darkMode: false,
    grayscale: false,
    highlightLinks: false,
    highlightHeadings: false,
    pauseAnimations: false,
    readableFont: false
  };

  const groups = [
    {
      id: "reading",
      title: "קריאה ותצוגה",
      icon: "Aa",
      open: true,
      controls: [
        { type: "stepper", key: "textLevel", label: "גודל טקסט", icon: "A", min: -1, max: 2 },
        { type: "toggle", key: "lineSpacing", label: "הגדלת ריווח שורות", icon: "↕" },
        { type: "toggle", key: "letterSpacing", label: "הגדלת ריווח אותיות", icon: "↔" },
        { type: "toggle", key: "readableFont", label: "פונט קריא", icon: "א" }
      ]
    },
    {
      id: "contrast",
      title: "ניגודיות וצבעים",
      icon: "◐",
      open: false,
      controls: [
        { type: "toggle", key: "highContrast", label: "ניגודיות גבוהה", icon: "◑" },
        { type: "toggle", key: "darkMode", label: "מצב כהה", icon: "☾" },
        { type: "toggle", key: "grayscale", label: "גווני אפור", icon: "◎" }
      ]
    },
    {
      id: "navigation",
      title: "ניווט והדגשות",
      icon: "⌁",
      open: false,
      controls: [
        { type: "toggle", key: "highlightLinks", label: "הדגשת קישורים", icon: "🔗" },
        { type: "toggle", key: "highlightHeadings", label: "הדגשת כותרות", icon: "H" },
        { type: "toggle", key: "pauseAnimations", label: "עצירת אנימציות", icon: "Ⅱ" }
      ]
    }
  ];

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
    root.dataset.accessibilityText = String(settings.textLevel);
    root.classList.toggle("accessibility-line-spacing", settings.lineSpacing);
    root.classList.toggle("accessibility-letter-spacing", settings.letterSpacing);
    root.classList.toggle("accessibility-high-contrast", settings.highContrast);
    root.classList.toggle("accessibility-dark-mode", settings.darkMode);
    root.classList.toggle("accessibility-grayscale", settings.grayscale);
    root.classList.toggle("accessibility-highlight-links", settings.highlightLinks);
    root.classList.toggle("accessibility-highlight-headings", settings.highlightHeadings);
    root.classList.toggle("accessibility-pause-animations", settings.pauseAnimations);
    root.classList.toggle("accessibility-readable-font", settings.readableFont);

    document.querySelectorAll("[data-accessibility-toggle]").forEach((button) => {
      const key = button.dataset.accessibilityToggle;
      button.setAttribute("aria-pressed", String(Boolean(settings[key])));
    });

    document.querySelectorAll("[data-accessibility-level]").forEach((output) => {
      output.textContent = getTextLevelLabel(settings.textLevel);
    });
  }

  function getTextLevelLabel(level) {
    if (level > 0) return `+${level}`;
    return String(level);
  }

  function adjustTextSize(direction) {
    const nextLevel = settings.textLevel + direction;
    settings.textLevel = Math.max(defaults.textLevel - 1, Math.min(2, nextLevel));
    saveSettings();
    applySettings();
  }

  function toggleSetting(key) {
    settings[key] = !settings[key];
    saveSettings();
    applySettings();
  }

  function resetSettings() {
    settings = { ...defaults };
    saveSettings();
    applySettings();
  }

  function createControl(control) {
    if (control.type === "stepper") {
      return `
        <div class="accessibility-stepper" aria-label="${control.label}">
          <span class="accessibility-control-icon" aria-hidden="true">${control.icon}</span>
          <span class="accessibility-control-label">${control.label}</span>
          <div class="accessibility-stepper-actions">
            <button type="button" data-accessibility-step="-1" aria-label="הקטנת טקסט">−</button>
            <output data-accessibility-level aria-live="polite">${getTextLevelLabel(settings.textLevel)}</output>
            <button type="button" data-accessibility-step="1" aria-label="הגדלת טקסט">+</button>
          </div>
        </div>
      `;
    }

    return `
      <button class="accessibility-option" type="button" data-accessibility-toggle="${control.key}" aria-pressed="false">
        <span class="accessibility-control-icon" aria-hidden="true">${control.icon}</span>
        <span>${control.label}</span>
      </button>
    `;
  }

  function createGroup(group) {
    const panelId = `accessibility-group-${group.id}`;
    return `
      <section class="accessibility-group">
        <button class="accessibility-group-toggle" type="button" aria-expanded="${group.open}" aria-controls="${panelId}">
          <span class="accessibility-group-icon" aria-hidden="true">${group.icon}</span>
          <span>${group.title}</span>
          <span class="accessibility-group-chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="accessibility-group-panel" id="${panelId}" ${group.open ? "" : "hidden"}>
          ${group.controls.map(createControl).join("")}
        </div>
      </section>
    `;
  }

  function createWidget() {
    if (document.querySelector(".accessibility-widget")) return;

    const widget = document.createElement("aside");
    widget.className = "accessibility-widget";
    widget.setAttribute("aria-label", "תפריט נגישות");
    widget.innerHTML = `
      <button class="accessibility-toggle" type="button" aria-label="פתיחת תפריט נגישות" aria-expanded="false" aria-controls="accessibility-panel">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.25a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm7.4 5.3a1.25 1.25 0 0 1-.95 1.49l-4.25.86v3.05l2.1 6.55a1.25 1.25 0 0 1-2.38.76l-1.82-5.68h-.2l-1.82 5.68a1.25 1.25 0 0 1-2.38-.76l2.1-6.55V9.9l-4.25-.86a1.25 1.25 0 0 1 .5-2.45l4.6.93h2.7l4.6-.93a1.25 1.25 0 0 1 1.45.96Z"/>
        </svg>
      </button>
      <div class="accessibility-backdrop" hidden></div>
      <div class="accessibility-panel" id="accessibility-panel" role="dialog" aria-modal="false" aria-labelledby="accessibility-title" hidden>
        <div class="accessibility-panel-header">
          <button class="accessibility-close" type="button" aria-label="סגירת תפריט נגישות">×</button>
          <div>
            <span class="accessibility-kicker">התאמות תצוגה</span>
            <h2 id="accessibility-title">נגישות</h2>
          </div>
        </div>
        <div class="accessibility-panel-body">
          ${groups.map(createGroup).join("")}
        </div>
        <div class="accessibility-panel-footer">
          <button class="accessibility-reset" type="button" data-accessibility-reset>איפוס כל ההגדרות</button>
          <a href="${getAccessibilityPagePath()}">הצהרת נגישות</a>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    const toggle = widget.querySelector(".accessibility-toggle");
    const panel = widget.querySelector(".accessibility-panel");
    const backdrop = widget.querySelector(".accessibility-backdrop");
    const closeButton = widget.querySelector(".accessibility-close");

    function setOpen(isOpen) {
      widget.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      panel.hidden = !isOpen;
      backdrop.hidden = !isOpen;
      document.body.classList.toggle("accessibility-menu-open", isOpen);

      if (isOpen) {
        closeButton.focus();
      }
    }

    toggle.addEventListener("click", () => {
      setOpen(!widget.classList.contains("is-open"));
    });

    closeButton.addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));

    widget.querySelectorAll(".accessibility-group-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const panelElement = document.getElementById(button.getAttribute("aria-controls"));
        const isOpen = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isOpen));
        panelElement.hidden = isOpen;
      });
    });

    widget.querySelectorAll("[data-accessibility-step]").forEach((button) => {
      button.addEventListener("click", () => adjustTextSize(Number(button.dataset.accessibilityStep)));
    });

    widget.querySelectorAll("[data-accessibility-toggle]").forEach((button) => {
      button.addEventListener("click", () => toggleSetting(button.dataset.accessibilityToggle));
    });

    widget.querySelector("[data-accessibility-reset]").addEventListener("click", resetSettings);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && widget.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    applySettings();
  }

  function getAccessibilityPagePath() {
    return window.location.pathname.includes("/workshops/") ? "../accessibility.html" : "accessibility.html";
  }

  applySettings();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createWidget);
  } else {
    createWidget();
  }
})();
