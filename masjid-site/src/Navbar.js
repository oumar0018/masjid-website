import React, { useState } from "react";
import { Link } from 'react-router-dom';

export default function Navbar({ links }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Default links including Videos (in case links prop is not provided or incomplete)
  const defaultLinks = [
    { href: "/", label: "Home" },
    { href: "/khutbahs", label: "Khutbahs" },
    { href: "/events", label: "Events" },
    { href: "/videos", label: "Videos" },
    { href: "/announcements", label: "Announcements" },
  ];
  const navLinks = links && links.length > 0 ? links : defaultLinks;

  return (
    <header style={navStyle}>
      <div style={{ fontWeight: "bold", fontSize: "20px", color: "#0f3d2e" }}>
        🕌 Masjid Ibadirrahman
      </div>

      {/* Hamburger button for mobile */}
      <button 
        style={hamburgerStyle} 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        ☰
      </button>

      {/* Links */}
      <div
        style={{
          ...navLinksStyle,
          display: menuOpen ? "flex" : "none",
          flexDirection: "column",
        }}
      >
        {navLinks.map((link) => (
          <Link key={link.href} to={link.href} style={navLinkStyle}>
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

const navStyle = {
  background: "white",
  padding: "16px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "10px",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
};

const navLinksStyle = {
  gap: "16px",
  background: "white",
  padding: "10px",
  borderRadius: "8px",
};

const navLinkStyle = {
  textDecoration: "none",
  color: "#374151",
  fontWeight: "600",
  fontSize: "14px",
  padding: "8px 12px",
  display: "block",
};

const hamburgerStyle = {
  background: "none",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  display: "block",
};