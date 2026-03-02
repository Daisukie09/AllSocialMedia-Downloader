const axios = require("axios");

async function fetchInstagram(url) {
  if (!url || typeof url !== "string") {
    throw new Error("Instagram link is required");
  }
  if (!url.includes("instagram.com")) {
    throw new Error("Invalid URL. Please enter a valid Instagram link.");
  }

  try {
    console.log("[IG] Using Puruboy API for:", url);

    const { data } = await axios.post(
      "https://puruboy-api.vercel.app/api/downloader/instagram",
      { url: url },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        timeout: 15000
      }
    );

    if (!data.success || !data.result || !data.result.medias || data.result.medias.length === 0) {
      throw new Error("No media found. The account might be private or the link is invalid.");
    }

    const result = data.result;
    const downloadLinks = [];

    result.medias.forEach(mediaItem => {
      const isVideo = mediaItem.format === "mp4" || mediaItem.url.includes(".mp4");

      if (isVideo && mediaItem.mute === "yes") {
        return;
      }

      downloadLinks.push({
        url: mediaItem.url,
        type: isVideo ? "video" : "image",
        label: isVideo
          ? `DOWNLOAD VIDEO (${mediaItem.quality})`
          : `DOWNLOAD IMAGE (${mediaItem.quality})`,
        extension: mediaItem.format || (isVideo ? "mp4" : "jpg")
      });
    });

    if (downloadLinks.length === 0) {
      throw new Error("No valid download link found.");
    }

    const thumbnailUrl =
      result.thumbnail ||
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png";

    return {
      title: result.title || "Instagram Content",
      author: data.author || "Instagram User",
      thumbnail: thumbnailUrl,
      medias: downloadLinks
    };

  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error("[IG Service Error]:", errorMsg);
    throw new Error("Failed to fetch data from server. Make sure the link is valid and the account is not private.");
  }
}

module.exports = { fetchInstagram };
