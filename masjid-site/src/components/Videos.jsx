import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import VideoCard from "../components/VideoCard";

export default function VideoGallery() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      console.error("Error loading videos:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "18px", color: "#0f3d2e" }}>Loading videos...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ 
        fontSize: "clamp(28px, 5vw, 36px)", 
        color: "#0f3d2e", 
        marginBottom: "32px",
        textAlign: "center"
      }}>
        📺 Video Library
      </h1>

      {videos.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: "16px" }}>
          No videos available at this time.
        </p>
      ) : (
        <div style={{
          display: "grid",
          gap: "24px",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}>
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}