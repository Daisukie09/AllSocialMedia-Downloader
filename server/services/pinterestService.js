const axios = require("axios");

async function fetchPinterestMedia(url) {
  if (!url || typeof url !== "string") {
    throw new Error("Pinterest link is required");
  }

  try {
    console.log("[PINTEREST] Using Ryzumi API for:", url);

    const apiUrl = `https://api.ryzumi.net/api/downloader/pinterest?url=${encodeURIComponent(url)}`;

    const { data } = await axios.get(apiUrl, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!data || (!data.image && !data.video)) {
      throw new Error("Failed to retrieve media data from Pinterest.");
    }

    const downloads = [];

    let thumbnail = data.image?.url || data.video?.poster || null;

    if (data.isImage && data.image?.url) {
      downloads.push({
        quality: "HD",
        format: "jpg",
        url: data.image.url
      });
    } else if (!data.isImage && data.video) {
      const videoUrl = data.video.url || data.video.downloadUrl || data.url;

      if (videoUrl) {
        downloads.push({
          quality: data.video.quality || "HD",
          format: "mp4",
          url: videoUrl
        });
      }
    }

    if (downloads.length === 0) {
      throw new Error("Successfully connected to API but download link is empty.");
    }

    return {
      title: data.title || "Pinterest Media",
      thumbnail: thumbnail,
      downloads: downloads
    };

  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error("[PINTEREST ERROR]:", errorMsg);
    throw new Error("Failed to process Pinterest link. Make sure the link is valid and not from a private board.");
  }
}

module.exports = { fetchPinterestMedia };
