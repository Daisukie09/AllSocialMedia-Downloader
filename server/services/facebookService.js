const axios = require("axios");

async function fetchFacebook(url) {
  if (!url || typeof url !== "string") {
    throw new Error("Facebook link is required");
  }
  if (!url.includes("facebook.com") && !url.includes("fb.watch")) {
    throw new Error("Invalid URL. Please enter a valid Facebook link.");
  }

  try {
    console.log("[FB] Using Puruboy API for:", url);

    const { data } = await axios.post(
      "https://puruboy-api.vercel.app/api/downloader/fbdl",
      { url: url },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }
    );

    if (!data.success || !data.result) {
      throw new Error("Failed to fetch data. Make sure the video is set to Public.");
    }

    const result = data.result;
    const downloadLinks = [];

    if (result.video_hd) {
      downloadLinks.push({
        url: result.video_hd,
        type: "video",
        label: "Download Video (HD)"
      });
    }

    if (result.video_sd) {
      downloadLinks.push({
        url: result.video_sd,
        type: "video",
        label: "Download Video (SD)"
      });
    }

    if (downloadLinks.length === 0) {
      throw new Error("Download link not found or video is not supported.");
    }

    const thumbnailUrl =
      result.thumbnail ||
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png";

    return {
      title: "Facebook Video",
      author: data.author || "Facebook User",
      thumbnail: thumbnailUrl,
      medias: downloadLinks
    };

  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error("[FB Service Error]:", errorMsg);
    throw new Error("Failed to fetch data from server. Make sure the link is valid and the video is set to public.");
  }
}

module.exports = { fetchFacebook };
