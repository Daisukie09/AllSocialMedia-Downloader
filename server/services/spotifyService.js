const axios = require("axios");

// Fungsi validasi URL Spotify agar user tidak memasukkan link sembarangan
function isSpotifyUrl(url) {
  const regex = /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]+/;
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
    console.log("[SPOTIFY] Using Ryzumi API for:", url);

    // 1. Menyusun URL API (Metode GET sesuai dokumentasi Ryzumi)
    const apiUrl = `https://api.ryzumi.net/api/downloader/spotify?url=${encodeURIComponent(url)}`;
    
    const { data } = await axios.get(apiUrl, {
      headers: {
        "Accept": "application/json"
      }
    });

    // 2. Validasi Response dari Ryzumi
    if (!data || !data.success || !data.link) {
      throw new Error("Failed to get download link from central server.");
    }

    const metadata = data.metadata || {};

    // 3. Menyusun format balasan agar sesuai dengan yang dibaca oleh UI Zeronaut kamu
    const downloadLinks = [
      {
        url: data.link,         // Link unduhan lagu
        quality: "High Quality",
        extension: "mp3",
        type: "audio"
      }
    ];

    // 4. Return Data
    return {
      title: metadata.title || "Spotify Track",
      author: metadata.artists || "Unknown Artist",
      duration: null, // Durasi tidak disediakan oleh API Ryzumi
      thumbnail: metadata.cover || null, // Menggunakan cover album
      downloadLinks: downloadLinks, // Array untuk dirender jadi tombol di App.jsx
    };

  } catch (error) {
    // Sistem pelacak error
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error("[SPOTIFY ERROR]:", errorMsg);
    throw new Error("Failed to extract Spotify link. Make sure the link is a song track (not a playlist).");
  }
}

module.exports = { fetchSpotify };
