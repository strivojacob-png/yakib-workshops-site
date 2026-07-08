const SOCIAL_PLACEHOLDER_URL = window.location.pathname.includes("/workshops/")
  ? "../coming-soon.html"
  : "coming-soon.html";

const FACEBOOK_URL = SOCIAL_PLACEHOLDER_URL;
const INSTAGRAM_URL = SOCIAL_PLACEHOLDER_URL;
const TIKTOK_URL = SOCIAL_PLACEHOLDER_URL;
const WHATSAPP_MESSAGE = "שלום יקי, אשמח לקבל פרטים על הסדנאות.";
const WHATSAPP_URL = `https://wa.me/972526022321?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const EMAIL_URL = "mailto:yakib.officiai@gmail.com";

const SOCIAL_URLS = {
  facebook: FACEBOOK_URL,
  instagram: INSTAGRAM_URL,
  tiktok: TIKTOK_URL
};

const CONTACT_URLS = {
  whatsapp: WHATSAPP_URL,
  email: EMAIL_URL
};

document.querySelectorAll("[data-social-link]").forEach((link) => {
  const url = SOCIAL_URLS[link.dataset.socialLink];
  if (url) link.href = url;
});

document.querySelectorAll("[data-contact-link]").forEach((link) => {
  const url = CONTACT_URLS[link.dataset.contactLink];
  if (url) link.href = url;
});
