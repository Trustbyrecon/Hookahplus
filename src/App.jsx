function App() {
  return (
    <div style={{
      backgroundColor: 'black',
      color: 'white',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* ✅ Use public path */}
      <img 
        src="/hookah-logo.png" 
        alt="Hookah+ Logo" 
        style={{ width: '150px', marginBottom: '20px' }} 
      />

      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        The Future of Lounge Management Starts Here
      </h1>
    </div>
  );
}

export default App;
