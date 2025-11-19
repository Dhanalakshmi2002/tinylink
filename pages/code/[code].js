// pages/code/[code].js
import '../styles/stats.css';

export async function getServerSideProps({ params, res }) {
  const code = params.code;
  // call internal API (server-side)
  const base = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || `http://${process.env.VERCEL_URL || 'localhost:3000'}`;
  const apiUrl = `${base}/api/links/${code}`;

  // Use node-fetch not available; use server-side pg connection instead for reliability
  // But to keep code simple and matching spec, we'll query DB directly:
  const { query } = require('../../lib/db');
  const result = await query('SELECT code, target_url, clicks, last_clicked, created_at FROM links WHERE code = $1', [code]);
  if (!result || result.rowCount === 0) {
    return { notFound: true };
  }
  const link = result.rows[0];

  return { props: { link } };
}

export default function StatsPage({ link }) {
  return (
    <div className="container">
      <header className="header-row">
        <h1>TinyLink — Stats</h1>
        <div><a href="/">Dashboard</a></div>
      </header>

      <section className="card">
        <h3>Code: <span className="code">{link.code}</span></h3>
        <p><strong>Short URL:</strong> <a href={`/${link.code}`}>{(process.env.NEXT_PUBLIC_BASE_URL || '') + '/' + link.code}</a></p>
        <p><strong>Target:</strong> <span className="truncate" title={link.target_url}>{link.target_url}</span></p>
        <p><strong>Clicks:</strong> {link.clicks}</p>
        <p><strong>Last clicked:</strong> {link.last_clicked ? new Date(link.last_clicked).toLocaleString() : '—'}</p>
        <p><strong>Created:</strong> {link.created_at ? new Date(link.created_at).toLocaleString() : '—'}</p>
      </section>
    </div>
  );
}
