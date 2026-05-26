import { getYouTubeId, getYouTubeThumbnail } from "../utils/videoUtils";

export default function VideoCard({ video }) {
  const videoId = getYouTubeId(video.url);
  const thumbnail = getYouTubeThumbnail(video.url);
  
  const handleClick = () => {
    // Open the original YouTube URL in a new tab
    window.open(video.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
    >
      {/* Thumbnail with play icon overlay */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', backgroundColor: '#000' }}>
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={video.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#fff', textAlign: 'center' }}>
            🎬<br />Preview unavailable
          </div>
        )}
        {/* Play button overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      
      {/* Card content */}
      <div style={{ padding: '12px' }}>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '1rem', 
          fontWeight: '600',
          color: '#1f2937',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.4',
        }}>
          {video.title}
        </h3>
        <p style={{ 
          margin: 0, 
          fontSize: '0.75rem', 
          color: '#6b7280' 
        }}>
          {video.date ? new Date(video.date).toLocaleDateString() : ''}
        </p>
      </div>
    </div>
  );
}