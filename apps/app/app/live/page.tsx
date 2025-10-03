export default function Live() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>
        LIVE SESSIONS
      </h1>
      <p style={{
        fontSize: '1.1rem',
        color: '#94a3b8',
        textAlign: 'center',
        maxWidth: '500px',
        lineHeight: '1.6'
      }}>
        Real-time hookah lounge management
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1rem 2rem',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid #f59e0b',
        borderRadius: '0.5rem',
        color: '#f59e0b'
      }}>
        🔥 Live Dashboard - Coming Soon!
      </div>
    </div>
  );
}