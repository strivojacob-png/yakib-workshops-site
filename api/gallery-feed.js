const { getGalleryFeed } = require("../cloudinary-gallery-feed");

module.exports = async (req, res) => {
  try {
    const response = await getGalleryFeed();
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.status(response.statusCode).send(response.body);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load Cloudinary gallery",
      details: error.message
    });
  }
};
