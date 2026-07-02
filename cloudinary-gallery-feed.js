const https = require("https");

const CATEGORY_LABELS = {
  gallery: "גלריה",
  mevashlim: "מבשלים חיבור",
  etgar: "אתגר מחבר",
  field: "סדנאות שטח",
  process: "תהליכים קבוצתיים",
  schools: "בתי ספר וצוותי חינוך"
};

const CATEGORY_TAGS = Object.keys(CATEGORY_LABELS);

const requestCloudinarySearch = ({ cloudName, apiKey, apiSecret, expression }) => (
  new Promise((resolve, reject) => {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const body = JSON.stringify({
      expression,
      max_results: 100,
      with_field: ["tags", "context"],
      sort_by: [{ created_at: "desc" }]
    });

    const req = https.request({
      hostname: "api.cloudinary.com",
      path: `/v1_1/${cloudName}/resources/search`,
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    }, (res) => {
      let body = "";

      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Cloudinary returned ${res.statusCode}: ${body}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  })
);

const getCategoryFromTags = (tags = []) => (
  CATEGORY_TAGS.find((tag) => tag !== "gallery" && tags.includes(tag)) || "gallery"
);

const getTitleFromResource = (resource) => {
  const context = resource.context?.custom || resource.context || {};
  return context.title || resource.public_id.split("/").pop().replace(/[-_]/g, " ");
};

const getAltFromResource = (resource) => {
  const context = resource.context?.custom || resource.context || {};
  return context.alt || context.description || getTitleFromResource(resource);
};

const mapResourceToGalleryItem = (resource, type) => ({
  type,
  src: resource.secure_url,
  publicId: resource.public_id,
  category: getCategoryFromTags(resource.tags),
  title: getTitleFromResource(resource),
  alt: getAltFromResource(resource)
});

const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=300"
  },
  body: JSON.stringify(body)
});

const getGalleryFeed = async () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "demcs8ho";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const galleryFolder = process.env.CLOUDINARY_GALLERY_FOLDER || "gallery";

  if (!apiKey || !apiSecret) {
    return buildResponse(500, {
      error: "Missing Cloudinary API credentials",
      details: "Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the hosting environment."
    });
  }

  const folderExpression = `asset_folder="${galleryFolder}" OR folder="${galleryFolder}" OR public_id:${galleryFolder}/*`;

  const [images, videos] = await Promise.all([
    requestCloudinarySearch({
      cloudName,
      apiKey,
      apiSecret,
      expression: `resource_type:image AND (${folderExpression})`
    }),
    requestCloudinarySearch({
      cloudName,
      apiKey,
      apiSecret,
      expression: `resource_type:video AND (${folderExpression})`
    })
  ]);

  const items = [
    ...(images.resources || []).map((resource) => mapResourceToGalleryItem(resource, "image")),
    ...(videos.resources || []).map((resource) => mapResourceToGalleryItem(resource, "video"))
  ].sort((a, b) => a.publicId.localeCompare(b.publicId));

  return buildResponse(200, {
    source: "cloudinary",
    cloudName,
    folder: galleryFolder,
    items
  });
};

module.exports = {
  getGalleryFeed
};
