import { createClient } from '@/lib/supabase/server';

export async function GET(req) {
  try {
    const supabase = createClient();

    // get session via server client
    const { data } = await supabase.auth.getSession();

    // echo request cookies (raw) for debugging
    const cookieHeader = req.headers.get('cookie') || null;

    return new Response(JSON.stringify({ session: data.session || null, cookieHeader }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
