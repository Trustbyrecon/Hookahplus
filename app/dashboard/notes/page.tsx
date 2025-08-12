'use client';
import { useEffect, useState } from 'react';

type Item = {
  id: string; amount: number; currency: string; created: number; status: string;
  hp_session_id: string | null; hp_ref: string | null; hp_flavor_mix: string | null;
  hp_private_notes: string | null; hp_notes_updated_at: string | null; lounge: string | null;
};

export default function NotesDashboard(){
  const [pin, setPin] = useState(''); const [ok, setOk] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState('');

  const requiredPin = process.env.NEXT_PUBLIC_STAFF_DEMO_PIN || '735911';
  const verify = () => setOk(pin === requiredPin);

  const fetchData = async () => {
    setLoading(true); setError('');
    try{
      let url = '/.netlify/functions/getSessionNotes?limit=20';
      if (filter.startsWith('cs_')) url += '&checkoutSessionId=' + encodeURIComponent(filter);
      else if (filter) url += '&sessionId=' + encodeURIComponent(filter);
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
      else setError(data.error || 'Failed to load');
    }catch(e:any){ setError(e.message); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ if(ok) fetchData(); },[ok]);

  return (
    <main style={{maxWidth:980,margin:'48px auto',padding:'0 16px',display:'grid',gap:16}}>
      <h1>Notes Dashboard</h1>
      {!ok ? (
        <section style={{display:'grid',gap:8}}>
          <label htmlFor="pin">Enter Staff PIN</label>
          <input id="pin" type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN" style={{padding:8,borderRadius:8}} />
          <button onClick={verify} style={{padding:10,borderRadius:8}}>Unlock</button>
        </section>
      ) : (
        <>
          <section style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
            <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="hp_session_id or cs_..." style={{padding:8,borderRadius:8,flex:'1 1 260px'}} />
            <button onClick={fetchData} style={{padding:10,borderRadius:8}}>Refresh</button>
            {loading && <span>Loading…</span>}
            {error && <span style={{color:'tomato'}}>{error}</span>}
          </section>
          <section style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  <th style={{textAlign:'left',borderBottom:'1px solid #333',padding:'8px'}}>Time</th>
                  <th style={{textAlign:'left',borderBottom:'1px solid #333',padding:'8px'}}>Amount</th>
                  <th style={{textAlign:'left',borderBottom:'1px solid #333',padding:'8px'}}>Session</th>
                  <th style={{textAlign:'left',borderBottom:'1px solid #333',padding:'8px'}}>Flavor</th>
                  <th style={{textAlign:'left',borderBottom:'1px solid #333',padding:'8px'}}>Ref</th>
                  <th style={{textAlign:'left',borderBottom:'1px solid #333',padding:'8px'}}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id}>
                    <td style={{padding:'8px',borderBottom:'1px solid #222'}}>{new Date(it.created*1000).toLocaleString()}</td>
                    <td style={{padding:'8px',borderBottom:'1px solid #222'}}>${(it.amount/100).toFixed(2)} {it.currency?.toUpperCase() || 'USD'}</td>
                    <td style={{padding:'8px',borderBottom:'1px solid #222'}}><code>{it.hp_session_id || '—'}</code></td>
                    <td style={{padding:'8px',borderBottom:'1px solid #222'}}>{it.hp_flavor_mix || '—'}</td>
                    <td style={{padding:'8px',borderBottom:'1px solid #222'}}>{it.hp_ref || '—'}</td>
                    <td style={{padding:'8px',borderBottom:'1px solid #222',maxWidth:420,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={it.hp_private_notes || ''}>
                      {it.hp_private_notes || '—'}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !loading && (
                  <tr><td colSpan={6} style={{padding:'16px',opacity:.7}}>No notes yet.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}