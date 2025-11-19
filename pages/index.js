// pages/index.js
import { useEffect, useState } from 'react';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState('');
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState('');

  async function fetchLinks() {
    setLoading(true);
    const res = await fetch('/api/links');
    if (res.ok) {
      const data = await res.json();
      setLinks(data);
    } else {
      setLinks([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMsg(null);

    if (!target) {
      setMsg({ type: 'error', text: 'Please enter a URL (include http(s)://)' });
      return;
    }

    setCreating(true);
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_url: target, code: code || undefined })
    });

    if (res.status === 201) {
      const body = await res.json();
      setMsg({ type: 'success', text: `Created: ${body.short_url}` });
      setTarget(''); setCode('');
      fetchLinks();
    } else {
      const err = await res.json().catch(()=>({ error: 'Unknown error' }));
      setMsg({ type: 'error', text: err.error || 'Failed to create' });
    }
    setCreating(false);
  }

  async function handleDelete(c) {
    if (!confirm(`Delete ${c}?`)) return;
    const res = await fetch(`/api/links/${c}`, { method: 'DELETE' });
    if (res.ok) {
      fetchLinks();
    } else {
      alert('Failed to delete');
    }
  }

  function filtered() {
    if (!search) return links;
    const s = search.toLowerCase();
    return links.filter(l => l.code.toLowerCase().includes(s) || l.target_url.toLowerCase().includes(s));
  }

  return (
    <div className="container">
      <header className="header-row">
        <h1>TinyLink</h1>
        <div className="sub">Simple URL shortener</div>
      </header>

      <section className="card">
        <form onSubmit={handleCreate} className="form-row">
          <input className="input" placeholder="https://example.com/long/path" value={target} onChange={e=>setTarget(e.target.value)} />
          <input className="small" placeholder="custom code (optional) 6-8 chars" value={code} onChange={e=>setCode(e.target.value)} />
          <button className="button" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
        </form>
        <div style={{marginTop:8}}>
          <input className="input" placeholder="Search by code or URL" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}
      </section>

      <section className="card">
        <h3>Links</h3>
        {loading ? <div className="muted">Loading...</div> : (
          <table className="table">
            <thead>
              <tr><th>Short</th><th>Target</th><th>Clicks</th><th>Last Clicked</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered().length === 0 && <tr><td colSpan="5" className="muted">No results.</td></tr>}
              {filtered().map(link => (
                <tr key={link.code}>
                  <td><a className="code" href={`/${link.code}`} target="_blank" rel="noreferrer">{link.code}</a></td>
                  <td className="truncate" title={link.target_url}>{link.target_url}</td>
                  <td>{link.clicks}</td>
                  <td className="muted">{link.last_clicked ? new Date(link.last_clicked).toLocaleString() : '—'}</td>
                  <td>
                    <button className="mini" onClick={() => navigator.clipboard?.writeText(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/${link.code}`)}>Copy</button>
                    <a className="mini" href={`/code/${link.code}`}>Stats</a>
                    <button className="mini danger" onClick={() => handleDelete(link.code)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="muted small">Endpoints: GET /api/links | POST /api/links | GET /api/links/:code | DELETE /api/links/:code | GET /healthz</footer>
    </div>
  );
}
