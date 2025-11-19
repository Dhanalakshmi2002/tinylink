// pages/[code].js
import { query } from '../lib/db';

export async function getServerSideProps({ params, res }) {
  const { code } = params;
  const result = await query('SELECT target_url FROM links WHERE code = $1', [code]);

  if (!result || result.rowCount === 0) {
    // return 404 page
    return { notFound: true };
  }

  const target = result.rows[0].target_url;

  // increment clicks and update last_clicked (do not wait for perfect transaction ordering)
  await query('UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1', [code]);

  // send explicit 302 redirect
  res.writeHead(302, { Location: target });
  res.end();
  return { props: {} };
}

export default function RedirectPage() {
  // this will never render because we end the response in getServerSideProps,
  // but Next.js requires default export
  return null;
}
