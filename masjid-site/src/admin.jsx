import { useState, useEffect } from "react";
import { getEmbedSrc } from "./utils/videoUtils";
import VideoCard from "./components/VideoCard";

const { supabase } = await import("/src/supabaseClient.js");

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sermons, setSermons] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDay, setEventDay] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventTeacher, setEventTeacher] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const { data: sermonData } = await supabase.from("sermons").select("*").order("date", { ascending: false });
      const { data: programsData } = await supabase.from("programs").select("*");
      const { data: announcementsData } = await supabase.from("announcements").select("*").order("date", { ascending: false });
      const { data: videosData } = await supabase.from("videos").select("*").order("date", { ascending: false });
      setSermons(sermonData || []);
      setPrograms(programsData || []);
      setAnnouncements(announcementsData || []);
      setVideos(videosData || []);
    } catch (err) {
      console.error("loadData error:", err);
      setStatus("❌ Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // SAFE login function – no JSON.stringify anywhere
  async function loginAdmin(email, password) {
    setStatus("");
    // Guard against accidentally receiving an event object
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      setStatus("❌ Invalid email or password");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("❌ Login failed: " + error.message);
        return;
      }
      if (data.user.email !== "masjidibadirrahman@gmail.com") {
        setStatus("❌ Access denied: not authorized");
        await supabase.auth.signOut();
        return;
      }
      setIsAdmin(true);
      setStatus("✅ Logged in as admin");
      await loadData();
    } catch (err) {
      console.error("Login error:", err);
      setStatus("❌ Unexpected error: " + (err.message || "Unknown error"));
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setEmail("");
    setPassword("");
    setSermons([]);
    setPrograms([]);
    setAnnouncements([]);
    setVideos([]);
    setStatus("");
  }

  function sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  }

async function uploadSermon() {
    console.log("=== uploadSermon started ===");
    console.log("Title:", title);
    console.log("Date:", date);
    console.log("PDF file:", pdfFile);
    console.log("Audio file:", audioFile);
    
    if (!title || !date) {
      console.log("❌ Validation failed: missing title or date");
      setStatus("❌ Please provide title and date");
      return;
    }
    
    console.log("✅ Validation passed, starting upload...");
    setStatus("Uploading...");
    setUploadProgress(0);
    
    try {
      let pdfUrl = null, audioUrl = null;
      
      if (pdfFile) {
        console.log("Uploading PDF...");
        const pdfName = `${Date.now()}_${sanitizeFileName(pdfFile.name)}`;
        const { error: pdfError } = await supabase.storage.from("sermons-files").upload(pdfName, pdfFile);
        if (pdfError) throw pdfError;
        const { data: pdfData } = supabase.storage.from("sermons-files").getPublicUrl(pdfName);
        pdfUrl = pdfData.publicUrl;
        console.log("PDF uploaded, URL:", pdfUrl);
      }
      
      if (audioFile) {
        console.log("Uploading audio...");
        const audioName = `${Date.now()}_${sanitizeFileName(audioFile.name)}`;
        const { error: audioError } = await supabase.storage.from("khutbah-audio").upload(audioName, audioFile);
        if (audioError) throw audioError;
        const { data: audioData } = supabase.storage.from("khutbah-audio").getPublicUrl(audioName);
        audioUrl = audioData.publicUrl;
        console.log("Audio uploaded, URL:", audioUrl);
      }
      
      console.log("Inserting sermon record...");
      const { error: insertError } = await supabase.from("sermons").insert([{ title, date, pdf_url: pdfUrl, audio_url: audioUrl }]);
      if (insertError) throw insertError;
      
      console.log("✅ Upload complete!");
      setStatus("✅ Khutbah uploaded!");
      setTitle("");
      setDate("");
      setPdfFile(null);
      setAudioFile(null);
      await loadData();
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setStatus("❌ Upload failed: " + err.message);
    } finally {
      setUploadProgress(0);
    }
  }

  async function uploadEvent() {
    if (!eventTitle || !eventDay || !eventTime || !eventTeacher) { setStatus("❌ Fill all event fields"); return; }
    const { error } = await supabase.from("programs").insert([{ title: eventTitle, day: eventDay, time: eventTime, teacher: eventTeacher }]);
    if (error) { setStatus("❌ Event upload failed"); return; }
    setStatus("✅ Event uploaded!");
    setEventTitle(""); setEventDay(""); setEventTime(""); setEventTeacher("");
    await loadData();
  }

  async function uploadAnnouncement() {
      if (!announcementTitle || !announcementMessage) { setStatus("❌ Fill all announcement fields"); return; }
      try {
        const { error } = await supabase.from("announcements").insert([{ title: announcementTitle, message: announcementMessage, date: new Date().toISOString().split("T")[0] }]);
        if (error) throw error;
        setStatus("✅ Announcement uploaded!");
        setAnnouncementTitle(""); setAnnouncementMessage("");
        await loadData();
      } catch (err) { setStatus("❌ Upload failed: " + err.message); }
    }

    async function uploadVideo() {
    console.log("=== uploadVideo started ===");
    console.log("Video Title:", videoTitle);
    console.log("Video URL:", videoUrl);
    
    if (!videoTitle || !videoUrl) {
      console.log("❌ Validation failed: missing title or URL");
      setStatus("❌ Fill all video fields");
      return;
    }
    
    console.log("✅ Validation passed, inserting into Supabase...");
    setStatus("Uploading...");
    
    try {
      const { data, error } = await supabase
        .from("videos")
        .insert([{ title: videoTitle, url: videoUrl, date: new Date() }])
        .select();
      
      if (error) {
        console.error("❌ Supabase insert error:", error);
        setStatus("❌ Video upload failed: " + error.message);
        return;
      }
      
      console.log("✅ Video inserted successfully:", data);
      setStatus("✅ Video uploaded!");
      setVideoTitle("");
      setVideoUrl("");
      await loadData();
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      setStatus("❌ Upload failed: " + err.message);
    }
  }

  async function deleteSermon(id) { if (window.confirm("Delete?")) { await supabase.from("sermons").delete().eq("id", id); await loadData(); setStatus("Deleted"); } }
  async function deleteEvent(id) { if (window.confirm("Delete?")) { await supabase.from("programs").delete().eq("id", id); await loadData(); setStatus("Deleted"); } }
  async function deleteAnnouncement(id) { if (window.confirm("Delete?")) { await supabase.from("announcements").delete().eq("id", id); await loadData(); setStatus("Deleted"); } }
  async function deleteVideo(id) { if (window.confirm("Delete?")) { await supabase.from("videos").delete().eq("id", id); await loadData(); setStatus("Deleted"); } }

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.email === "masjidibadirrahman@gmail.com") {
        setIsAdmin(true);
        await loadData();
      }
    };
    checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user.email === "masjidibadirrahman@gmail.com") {
        setIsAdmin(true);
        await loadData();
      } else {
        setIsAdmin(false);
      }
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (status) { const timer = setTimeout(() => setStatus(""), 5000); return () => clearTimeout(timer); }
  }, [status]);

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <header style={navStyle}>
        <div style={{ fontWeight: "bold", fontSize: "22px", color: "#0f3d2e" }}>🕌 Admin Dashboard</div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isAdmin && <button onClick={logout} style={{ ...buttonStyle, background: "#b91c1c" }}>Logout</button>}
          <button style={menuButtonStyle} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
        <nav style={{ ...navLinksStyle, display: menuOpen ? "flex" : "none" }}>
          <a href="#khutbah" style={navLinkStyle}>Khutbahs</a>
          <a href="#event" style={navLinkStyle}>Events</a>
          <a href="#announcement" style={navLinkStyle}>Announcements</a>
          <a href="#video" style={navLinkStyle}>Videos</a>
        </nav>
      </header>

      {status && <div style={{ textAlign: "center", marginTop: "10px", padding: "8px", background: "#e5e7eb", borderRadius: "8px", maxWidth: 980, marginLeft: "auto", marginRight: "auto" }}>{status}</div>}

      {!isAdmin ? (
        <div style={cardStyle}>
          <h2 style={{ textAlign: "center" }}>Admin Login</h2>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          {/* ✅ Critical fix: arrow function prevents event object from being passed */}
          <button style={buttonStyle} onClick={() => loginAdmin(email, password)}>Login</button>
        </div>
      ) : (
        <>
          {loading && <div style={{ textAlign: "center" }}>Loading...</div>}
          <Section title="🕌 Upload Khutbah" id="khutbah">
            <div style={cardStyle}>
              <input style={inputStyle} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <input style={inputStyle} type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
              <input style={inputStyle} type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />
              <button style={buttonStyle} onClick={uploadSermon}>Upload Khutbah</button>
            </div>
            {sermons.map(s => <div key={s.id} style={cardStyle}><h3>{s.title}</h3>{s.pdf_url && <a href={s.pdf_url} target="_blank" rel="noreferrer">📄 PDF</a>}{s.audio_url && <audio controls src={s.audio_url} />}<p><small>{new Date(s.date).toLocaleDateString()}</small></p><button style={deleteButtonStyle} onClick={() => deleteSermon(s.id)}>Delete</button></div>)}
          </Section>
          
          
          <Section title="🎥 Upload Video" id="video">
            <div style={cardStyle}>
              <input style={inputStyle} placeholder="Video Title" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
              <input style={inputStyle} placeholder="Video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
              <button style={buttonStyle} onClick={uploadVideo}>Upload Video</button>
            </div>
            <Section title="🎥 Manage Videos" id="video">
              {/* Video grid with cards */}
              {videos.length === 0 ? (
                <p style={{ textAlign: "center" }}>No videos yet.</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '20px',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  marginTop: '20px'
                }}>
                  {videos.map((v) => (
                    <div key={v.id} style={{ position: 'relative' }}>
                      <VideoCard video={v} />
                      <button 
                        style={{
                          ...deleteButtonStyle,
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          zIndex: 2,
                          padding: '4px 8px',
                          fontSize: '12px',
                          marginTop: 0,
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening video when clicking delete
                          deleteVideo(v.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </Section>

          <Section title="📚 Upload Event" id="event">
            <div style={cardStyle}>
              <input style={inputStyle} placeholder="Event Title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
              <input style={inputStyle} placeholder="Day" value={eventDay} onChange={(e) => setEventDay(e.target.value)} />
              <input style={inputStyle} placeholder="Time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
              <input style={inputStyle} placeholder="Teacher" value={eventTeacher} onChange={(e) => setEventTeacher(e.target.value)} />
              <button style={buttonStyle} onClick={uploadEvent}>Upload Event</button>
            </div>
            {programs.map(p => <div key={p.id} style={cardStyle}><b>{p.title}</b><p>{p.day} - {p.time}</p><small>{p.teacher}</small><button style={deleteButtonStyle} onClick={() => deleteEvent(p.id)}>Delete</button></div>)}
          </Section>
          <Section title="📢 Upload Announcement" id="announcement">
            <div style={cardStyle}>
              <input style={inputStyle} placeholder="Title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} />
              <textarea style={inputStyle} placeholder="Message" value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} rows="3" />
              <button style={buttonStyle} onClick={uploadAnnouncement}>Upload Announcement</button>
            </div>
            {announcements.map(a => <div key={a.id} style={cardStyle}><h3>{a.title}</h3><p>{a.message}</p><small>{new Date(a.date).toLocaleDateString()}</small><button style={deleteButtonStyle} onClick={() => deleteAnnouncement(a.id)}>Delete</button></div>)}
          </Section>
          
        </>
      )}
      <footer style={footerStyle}><p>Admin Panel - Masjid Ibadirrahman</p><p>© {new Date().getFullYear()}</p></footer>
    </div>
  );
}

function Section({ title, id, children }) {
  return <section id={id} style={{ padding: "36px 20px", maxWidth: 980, margin: "0 auto" }}><h2 style={{ color: "#0f3d2e", marginBottom: "18px", textAlign: "center" }}>{title}</h2>{children}</section>;
}

const navStyle = { background: "white", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 1000, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" };
const navLinksStyle = { flexDirection: "column", gap: "10px", background: "white", padding: "10px", position: "absolute", top: "56px", right: "18px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };
const navLinkStyle = { textDecoration: "none", color: "#374151", fontWeight: 600, fontSize: "14px" };
const menuButtonStyle = { background: "none", border: "none", fontSize: "22px", cursor: "pointer", display: "block" };
const cardStyle = { background: "white", padding: "18px", margin: "10px 0", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" };
const inputStyle = { display: "block", width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" };
const buttonStyle = { padding: "10px 14px", background: "#0f3d2e", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 };
const deleteButtonStyle = { padding: "8px 12px", background: "#b91c1c", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "10px" };
const footerStyle = { background: "#0f3d2e", color: "white", textAlign: "center", padding: "18px", marginTop: "36px", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" };