const axios = require("axios");

async function fetchYouTubeData(url) {
  if (!url || typeof url !== "string") {
    throw new Error("YouTube link is required");
  }

  const formats = [];
  let videoTitle = "YouTube Media";
  let videoThumbnail = null;
  let videoAuthor = "YouTube";

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  };

  // 1. EXTRACT VIDEO (MP4)
  try {
    const { data: videoData } = await axios.post(
      "https://puruboy-api.vercel.app/api/downloader/youtube",
      { url: url },
      { headers }
    );
    const resultVideo = videoData.result || videoData.data;

    if (resultVideo && resultVideo.downloadUrl) {
      videoTitle = resultVideo.title || videoTitle;
      videoThumbnail = resultVideo.thumbnail || videoThumbnail;
      videoAuthor = resultVideo.author || videoData.author || videoAuthor;

      formats.push({
        type: "video",
        quality: resultVideo.quality || "HD",
        extension: "mp4",
        url: resultVideo.downloadUrl,
      });
    }
  } catch (err) {
    console.error(`[VIDEO ERROR]`, err.message);
  }

  // 2. EXTRACT AUDIO (MP3)
  try {
    const { data: audioData } = await axios.post(
      "https://puruboy-api.vercel.app/api/downloader/ytmp3",
      { url: url },
      { headers }
    );

    const resultAudio = audioData.result || audioData.data || audioData;

    const audioLink =
      resultAudio?.download_url ||
      resultAudio?.downloadUrl ||
      resultAudio?.url ||
      resultAudio?.link ||
      resultAudio?.media;

    if (audioLink) {
      formats.push({
        type: "audio",
        quality: "128kbps",
        extension: "mp3",
        url: audioLink,
      });
    }
  } catch (err) {
    console.error(`[AUDIO ERROR]`, err.message);
  }

  // 3. FINALIZE
  if (formats.length === 0) {
    throw new Error("Failed to extract Video and Audio. The server might be busy, please try again later.");
  }

  return {
    title: videoTitle,
    thumbnail: videoThumbnail,
    duration: null,
    author: videoAuthor,
    formats: formats,
  };
}

module.exports = { fetchYouTubeData };
