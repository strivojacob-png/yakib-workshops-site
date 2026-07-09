const NOTIFY_TO = process.env.LEAD_NOTIFY_EMAIL || "yakib.officiai@gmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Yaki Buzaglo <onboarding@resend.dev>";

const fieldLabels = [
  ["name", "שם"],
  ["organization", "ארגון / בית ספר"],
  ["phone", "טלפון"],
  ["email", "אימייל"],
  ["workshop", "סדנה מבוקשת"],
  ["message", "הודעת הלקוח"]
];

const cleanValue = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ").trim();
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const parseSubmission = (event) => {
  const body = event.body ? JSON.parse(event.body) : {};
  const payload = body.payload || body.form_submission || body;
  const data = payload.data || payload.human_fields || payload;

  if (Array.isArray(data)) {
    return data.reduce((fields, item) => {
      const key = item.name || item.key || item.title;
      if (key) fields[key] = item.value;
      return fields;
    }, {});
  }

  return data && typeof data === "object" ? data : {};
};

const buildTextEmail = (fields) => {
  const lines = ["פנייה חדשה מהאתר – יקי בוזגלו", ""];

  fieldLabels.forEach(([key, label]) => {
    const value = cleanValue(fields[key]);
    if (!value) return;
    lines.push(`${label}:`);
    lines.push(value);
    lines.push("");
  });

  return lines.join("\n").trim();
};

const escapeHtml = (value) => (
  cleanValue(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>")
);

const buildHtmlEmail = (fields) => {
  const rows = fieldLabels
    .map(([key, label]) => {
      const value = cleanValue(fields[key]);
      if (!value) return "";
      return `
        <div style="margin:0 0 18px;">
          <div style="font-size:14px;font-weight:700;color:#3e5c4a;margin-bottom:4px;">${label}:</div>
          <div style="font-size:17px;color:#2b2b2b;line-height:1.7;">${escapeHtml(value)}</div>
        </div>`;
    })
    .filter(Boolean)
    .join("");

  return `
    <div dir="rtl" style="margin:0;padding:28px;background:#f8f6f1;font-family:Arial,'Noto Sans Hebrew',sans-serif;text-align:right;">
      <div style="max-width:680px;margin:0 auto;padding:30px;background:#ffffff;border-radius:18px;border:1px solid rgba(62,92,74,.16);">
        <h1 style="margin:0 0 26px;color:#263f31;font-size:26px;line-height:1.35;">פנייה חדשה מהאתר – יקי בוזגלו</h1>
        ${rows}
      </div>
    </div>`;
};

exports.handler = async (event) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    const fields = parseSubmission(event);
    const replyTo = cleanValue(fields.email);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [NOTIFY_TO],
        subject: "פנייה חדשה מהאתר – יקי בוזגלו",
        reply_to: replyTo || undefined,
        text: buildTextEmail(fields),
        html: buildHtmlEmail(fields)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend failed with status ${response.status}: ${errorText}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message })
    };
  }
};
