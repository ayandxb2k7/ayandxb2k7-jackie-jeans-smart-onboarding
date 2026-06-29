import { useTheme } from '../../context/ThemeContext';

export function Background() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base — dark uses BG image, light uses gradient */}
      {isDark ? (
        <div
          className="absolute inset-0 denim-texture"
          style={{
            backgroundImage: 'url(/jj-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay to ensure readability */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(5,4,20,0.75)' }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 denim-texture"
          style={{
            background: 'linear-gradient(135deg, #f0eff5 0%, #e8e7f4 30%, #dde9f5 60%, #f0eff5 100%)',
          }}
        />
      )}

      {/* Orb 1 — purple */}
      <div
        className="absolute float-orb"
        style={{
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          top: '-100px',
          left: '-100px',
          background: isDark
            ? 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0) 70%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0) 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Orb 2 — indigo */}
      <div
        className="absolute float-orb-2"
        style={{
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          top: '30%',
          right: '-80px',
          background: isDark
            ? 'radial-gradient(circle, rgba(79,70,229,0.16) 0%, rgba(79,70,229,0) 70%)'
            : 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, rgba(79,70,229,0) 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Orb 3 — cyan */}
      <div
        className="absolute float-orb-3"
        style={{
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          bottom: '-50px',
          left: '20%',
          background: isDark
            ? 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(14,165,233,0) 70%)'
            : 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, rgba(14,165,233,0) 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
               linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)`
            : `linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
               linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
