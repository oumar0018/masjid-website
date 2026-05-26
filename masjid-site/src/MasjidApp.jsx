import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { getEmbedSrc } from "./utils/videoUtils";
import ResponsiveEmbed from "./components/ResponsiveEmbed";
import VideoCard from "./components/VideoCard";


export default function MasjidApp() {
  const [sermons, setSermons] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [donations, setDonations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const { data: sermonData } = await supabase.from("sermons").select("*").order("date", { ascending: false });
      const { data: programsData } = await supabase.from("programs").select("*");
      const { data: donationsData } = await supabase.from("donations").select("*");
      const { data: announcementsData } = await supabase.from("announcements").select("*").order("date", { ascending: false });
      const { data: videosData } = await supabase.from("videos").select("*").order("date", { ascending: false });
    
      setSermons(sermonData || []);
      setPrograms(programsData || []);
      setDonations(donationsData || []);
      setAnnouncements(announcementsData || []);
      setVideos(videosData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data, error } = await supabase
        .from("announcements")   // must match table name
        .select("*")
        .order("date", { ascending: false }); // must match column name

      if (error) {
        console.error(error);
      } else {
        setAnnouncements(data);
      }
    }
    fetchAnnouncements();
  }, []);

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      
      {/* Navbar */}
      <header style={navStyle}>
        <div style={{ fontWeight: "bold", fontSize: "22px", color: "#0f3d2e" }}>
          🕌 MASJID IBADIRRAHMAN
        </div>
        <button style={menuButtonStyle} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <nav style={{ ...navLinksStyle, display: menuOpen ? "flex" : "none" }}>
          <a href="#announcements" style={navLinkStyle}>Announcements</a>
          <a href="#khutbah" style={navLinkStyle}>Khutbahs</a>
          <a href="#programs" style={navLinkStyle}>Programs</a>
          <a href="#donations" style={navLinkStyle}>Donations</a>
        </nav>
      </header>

      {/* Hero Banner */}
      <section style={bannerStyle}>
        {/* Background overlay for text contrast */}
        <div style={overlayStyle} />
        
        {/* Decorative elements */}
        <div style={decorTopLeft}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="gold">
            <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" />
          </svg>
        </div>
        <div style={decorBottomRight}>
          <div style={crescentStyle} />
        </div>
        <div style={patternOverlay} />
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ color: "white", margin: 0, fontSize: "clamp(20px, 5vw, 32px)", textAlign: "center", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
            جامع عباد الرحمن للمرحوم الحاج لون موسى مي رودي
          </h1>
          <p style={{ color: "white", textAlign: "center", marginTop: "10px", fontSize: "clamp(14px, 3vw, 18px)", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
            Serving the community with faith, knowledge, and unity
          </p>
        </div>
      </section>

      {/* Loading/Error */}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {/* Sections */}

          {/* Sections */}
    <Section title="🎥 Videos" id="videos">
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #0f3d2e", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : videos.length === 0 ? (
        <p style={{ textAlign: "center" }}>No videos yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </Section>


      <Section title="📢 Announcements" id="announcements">
        {announcements.length === 0 ? (
          <p style={{ textAlign: "center" }}>No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} style={cardStyle}>
              <h3>{a.title}</h3>
              <p>{a.message}</p>
              <small>{new Date(a.date).toLocaleDateString()}</small>
            </div>
          ))
        )}
      </Section>

      <Section title="🕌 Khutbahs" id="khutbah">
      {sermons.length === 0 ? (
        <p style={{ textAlign: "center" }}>No khutbah uploaded yet.</p>
      ) : (
        <div style={gridStyle}>
          {sermons.map((s) => (
            <div key={s.id} style={cardStyle}>
              <h3>{s.title}</h3>
              
              {/* PDF download */}
              {s.pdf_url && (
                <a href={s.pdf_url} target="_blank" rel="noreferrer">
                  Download PDF
                </a>
              )}

              {/* Audio player */}
              {s.audio_url && (
                <div style={{ marginTop: "10px" }}>
                  <audio controls style={{ width: "100%" }}>
                    <source src={s.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <a
                    href={s.audio_url}
                    download
                    style={{ display: "block", marginTop: "8px", color: "#0f3d2e" }}
                  >
                    ⬇️ Download Audio
                  </a>
                </div>
              )}

              <p>
                <small>{new Date(s.date).toLocaleDateString()}</small>
              </p>
            </div>
          ))}
        </div>
      )}
    </Section>


      <Section title="📚 Programs" id="programs">
        {programs.length === 0 ? (
          <p style={{ textAlign: "center" }}>No programs yet.</p>
        ) : (
          programs.map((p) => (
            <div key={p.id} style={cardStyle}>
              <b>{p.title}</b>
              <p>{p.day} - {p.time}</p>
              <small>{p.teacher}</small>
            </div>
          ))
        )}
      </Section>

      <Section title="💳 Donations" id="donations">
        {donations.length === 0 ? (
          <p style={{ textAlign: "center" }}>No donation info yet.</p>
        ) : (
          donations.map((d) => (
            <div key={d.id} style={cardStyle}>
              <p><b>{d.bank_name}</b></p>
              <p>{d.account_name}</p>
              <p>{d.account_number}</p>
            </div>
          ))
        )}
      </Section>

      {/* Footer */}
      <footer style={footerStyle}>
        <p>📍 Masjid Ibadirrahman, Bachirawa Zangon Bare-bari, Kano State, Nigeria</p>
        <p>Contact: masjidibadirrahman@gmail.com | +234-8031951818</p>
        <p>© {new Date().getFullYear()} Masjid Ibadirrahman. All rights reserved.</p>
      </footer>
    </div>
  );
}

/* ✅ Reusable Section Component */
function Section({ title, id, children }) {
  return (
    <section id={id} style={{ padding: "40px 20px" }}>
      <h2 style={{ color: "#0f3d2e", marginBottom: "20px", textAlign: "center", fontSize: "clamp(18px, 4vw, 24px)" }}>{title}</h2>
      {children}
    </section>
  );
}

/* ✅ Styles */
/* ✅ Styles */
const navStyle = {
  background: "white",
  padding: "16px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const navLinksStyle = {
  flexDirection: "column",
  gap: "10px",
  background: "white",
  padding: "10px",
  position: "absolute",
  top: "60px",
  right: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const navLinkStyle = {
  textDecoration: "none",
  color: "#374151",
  fontWeight: "600",
  fontSize: "14px",
  padding: "8px 12px",
  borderRadius: "6px",
  transition: "background 0.2s ease",
};

const menuButtonStyle = {
  background: "none",
  border: "none",
  fontSize: "22px",
  cursor: "pointer",
  display: "block",
  color: "#0f3d2e",
};

const cardStyle = {
  background: "white",
  padding: "20px",
  margin: "10px 0",
  borderRadius: "10px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
};

const footerStyle = {
  background: "#0f3d2e",
  color: "white",
  textAlign: "center",
  padding: "20px",
  marginTop: "40px",
  borderTopLeftRadius: "12px",
  borderTopRightRadius: "12px",
};


const bannerStyle = {
  position: 'relative',
  backgroundImage: 'url("https://images.unsplash.com/photo-1565546199063-db12b3f94588?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80")', // mosque image
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: '60px 20px',
  textAlign: 'center',
  overflow: 'hidden',
  minHeight: '250px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderBottom: '4px solid #d4af37',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.55)', // dark overlay for text contrast
  zIndex: 1,
};

// Decorative geometric pattern overlay (subtle)
const patternOverlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 8px)',
  pointerEvents: 'none',
  zIndex: 1,
};

const decorTopLeft = {
  position: 'absolute',
  top: '15px',
  left: '15px',
  zIndex: 2,
  opacity: 0.7,
};

const decorBottomRight = {
  position: 'absolute',
  bottom: '15px',
  right: '15px',
  zIndex: 2,
};

const crescentStyle = {
  width: '50px',
  height: '50px',
  backgroundColor: 'rgba(255,215,0,0.3)',
  borderRadius: '50%',
  boxShadow: '-10px 0 0 0 rgba(255,215,0,0.5) inset, 0 0 0 2px rgba(255,215,0,0.6)',
  transform: 'rotate(45deg)',
};