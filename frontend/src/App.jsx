import { useState } from "react";
import './App.css'

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [videoSrc, setVideoSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) throw new Error("Failed to download");
      
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);
      setVideoSrc(videoUrl);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Video Downloader</h1>
      <input
        type="text"
        placeholder="Enter video URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border p-2 w-full max-w-md rounded-lg shadow-sm"
      />
      <button
        onClick={handleDownload}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        disabled={loading}
      >
        {loading ? "Downloading..." : "Download Video"}
      </button>
      {videoSrc && (
        <video controls src={videoSrc} className="mt-4 w-full max-w-md rounded-lg shadow-lg" />
      )}
    </div>
  );
}
