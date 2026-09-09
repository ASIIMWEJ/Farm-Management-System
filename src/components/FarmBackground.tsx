import { Box } from '@mui/material';

/**
 * Full-viewport decorative farm backdrop: a soft pasture gradient with simple,
 * flat-style silhouettes of a barn, cow, hen and sheep. Purely decorative (aria-hidden).
 */
export default function FarmBackground() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #fdf6e3 0%, #eaf3df 35%, #d9ecd1 65%, #cbe6bd 100%)',
      }}
    >
      {/* Sun */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: -40, md: -20 },
          right: { xs: -40, md: 60 },
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ffe4a3 0%, #ffd166 55%, rgba(255,209,102,0) 75%)',
          opacity: 0.9,
        }}
      />

      {/* Rolling hills */}
      <Box
        component="svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%', opacity: 0.9 }}
      >
        <path fill="#bfe0ab" d="M0,224 C240,288 480,160 720,192 C960,224 1200,288 1440,224 L1440,320 L0,320 Z" />
        <path fill="#a3d089" d="M0,256 C240,320 480,224 720,256 C960,288 1200,224 1440,256 L1440,320 L0,320 Z" />
      </Box>

      {/* Barn */}
      <Box
        component="svg"
        viewBox="0 0 200 160"
        sx={{
          position: 'absolute',
          bottom: { xs: 10, md: 30 },
          left: { xs: -20, md: 40 },
          width: { xs: 140, md: 200 },
          opacity: 0.55,
        }}
      >
        <polygon points="20,70 100,20 180,70" fill="#8a4a3a" />
        <rect x="30" y="70" width="140" height="80" fill="#c96a23" />
        <rect x="85" y="100" width="30" height="50" fill="#5b2f22" />
        <rect x="45" y="85" width="20" height="20" fill="#fdf6e3" />
        <rect x="135" y="85" width="20" height="20" fill="#fdf6e3" />
      </Box>

      {/* Cow */}
      <Box
        component="svg"
        viewBox="0 0 200 120"
        sx={{
          position: 'absolute',
          bottom: { xs: 20, md: 40 },
          left: { xs: '55%', md: '38%' },
          width: { xs: 110, md: 160 },
          opacity: 0.5,
        }}
      >
        <ellipse cx="100" cy="70" rx="70" ry="38" fill="#ffffff" />
        <circle cx="45" cy="55" r="10" fill="#2b2b2b" />
        <circle cx="140" cy="60" r="14" fill="#2b2b2b" />
        <circle cx="95" cy="65" r="9" fill="#2b2b2b" />
        <circle cx="70" cy="90" r="9" fill="#2b2b2b" />
        <ellipse cx="35" cy="45" rx="20" ry="16" fill="#ffffff" />
        <circle cx="30" cy="42" r="3.5" fill="#2b2b2b" />
        <rect x="30" y="100" width="10" height="18" fill="#ffffff" />
        <rect x="60" y="102" width="10" height="18" fill="#ffffff" />
        <rect x="120" y="102" width="10" height="18" fill="#ffffff" />
        <rect x="150" y="100" width="10" height="18" fill="#ffffff" />
      </Box>

      {/* Sheep */}
      <Box
        component="svg"
        viewBox="0 0 140 100"
        sx={{
          position: 'absolute',
          bottom: { xs: 15, md: 35 },
          right: { xs: '8%', md: '20%' },
          width: { xs: 90, md: 120 },
          opacity: 0.5,
        }}
      >
        <ellipse cx="70" cy="55" rx="45" ry="28" fill="#f2f2f2" />
        <circle cx="30" cy="45" r="14" fill="#5b5b5b" />
        <rect x="30" y="78" width="8" height="16" fill="#5b5b5b" />
        <rect x="55" y="80" width="8" height="16" fill="#5b5b5b" />
        <rect x="85" y="80" width="8" height="16" fill="#5b5b5b" />
        <rect x="105" y="78" width="8" height="16" fill="#5b5b5b" />
      </Box>

      {/* Hen */}
      <Box
        component="svg"
        viewBox="0 0 100 100"
        sx={{
          position: 'absolute',
          bottom: { xs: 10, md: 25 },
          right: { xs: '30%', md: '45%' },
          width: { xs: 55, md: 75 },
          opacity: 0.45,
        }}
      >
        <ellipse cx="45" cy="60" rx="30" ry="22" fill="#e0523f" />
        <circle cx="72" cy="42" r="14" fill="#e0523f" />
        <polygon points="84,40 96,44 84,48" fill="#ffb347" />
        <polygon points="65,26 70,14 76,27" fill="#c9302c" />
        <rect x="35" y="80" width="6" height="14" fill="#ffb347" />
        <rect x="55" y="80" width="6" height="14" fill="#ffb347" />
      </Box>
    </Box>
  );
}
