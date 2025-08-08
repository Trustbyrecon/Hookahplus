// app/page.tsx
export default function Home() {
  return (
    <main style={{maxWidth:880,margin:'64px auto',padding:'0 16px'}}>
      <h1>Hookah+</h1>
      <p>Session reimagined. Loyalty reinforced.</p>

      <ul style={{lineHeight:1.8}}>
        <li><a href="/demo">Demo</a></li>
        <li><a href="/staff/notes">Staff Notes</a></li>
        <li><a href="/dashboard/notes">Notes Dashboard</a></li>
        <li><a href="/checkout/success">Success page</a></li>
        <li><a href="/checkout/cancel">Cancel page</a></li>
      </ul>
    </main>
  );
}
