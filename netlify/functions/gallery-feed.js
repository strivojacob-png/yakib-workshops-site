const { getGalleryFeed } = require("../../cloudinary-gallery-feed");

exports.handler = async () => {
  try {
    return await getGalleryFeed();
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        error: "Failed to load Cloudinary gallery",
        details: error.message
      })
    };
  }
};
