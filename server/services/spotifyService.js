const axios = require("axios");

function isSpotifyUrl(url) {
  const regex =
    /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]+/;
  return regex.test(url);
}

async function fetchSpotify(url) {
  if (!url || typeof url !== "string") {
    throw new Error("Spotify link must be filled in");
  }

  if (!isSpotifyUrl(url)) {
    throw new Error("Invalid URL. Please enter the correct Spotify song link.");
  }

  try {
    console.log("[SPOTIFY] Fetching metadata for:", url);

    // ── Step 1: Fetch metadata (action=info or default GET) ──────────────
    const metaUrl = `https://zenithapi-zeta.vercel.app/api/spotify?url=${encodeURIComponent(url)}`;

    const { data } = await axios.get(metaUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    console.log("[SPOTIFY] Raw API response:", JSON.stringify(data));

    // ── Step 2: Validate response using new field names ──────────────────
    if (!data || !data.status) {
      throw new Error("API returned an unsuccessful response.");
    }

    if (!data.download) {
      throw new Error("Failed to get download link from API.");
    }

    // ── Step 3: Build download link using the 'download' field ───────────
    //    The new API already provides a ready-to-use download URL
    const downloadLinks = [
      {
        url: data.download,
        quality: "High Quality",
        extension: "mp3",
        type: "audio",
      },
    ];

    // ── Step 4: Return normalized data for the UI ─────────────────────────
    return {
      title:         data.title    || "Spotify Track",
      author:        data.artist   || "Unknown Artist",
      duration:      data.duration || null,
      thumbnail:     data.cover    || null,
      downloadLinks: downloadLinks,
    };

  } catch (error) {
    const errorMsg = error.response
      ? JSON.stringify(error.response.data)
      : error.message;

    console.error("[SPOTIFY ERROR]:", errorMsg);

    throw new Error(
      "Failed to extract Spotify link. Make sure the link is a song track (not a playlist)."
    );
  }
}

module.exports = { fetchSpotify };
