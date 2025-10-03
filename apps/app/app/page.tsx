export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        background: 'linear-gradient(45deg, #14b8a6, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>
        HOOKAH+
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: '#a1a1aa',
        textAlign: 'center',
        maxWidth: '600px',
        lineHeight: '1.6'
      }}>
        The Future of Hookah Lounge Management
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1rem 2rem',
        background: 'rgba(20, 184, 166, 0.1)',
        border: '1px solid #14b8a6',
        borderRadius: '0.5rem',
        color: '#14b8a6'
      }}>
        🎯 RWO Success: Pure HTML/JSX App Deployed!
      </div>
    </div>
  );
}