import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_SECRET_KEY = (
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)?.trim();

const supabase =
  SUPABASE_URL && SUPABASE_SECRET_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

function json(res, status, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(status).json(payload);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!supabase) {
    return json(res, 500, {
      success: false,
      error: 'Missing SUPABASE_URL or SUPABASE_SECRET_KEY in Vercel Environment Variables.',
    });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('inventory_sync')
        .select('data, updated_at')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;

      return json(res, 200, {
        success: true,
        data: data?.data ?? null,
        updatedAt: data?.updated_at ?? null,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const inventoryData = body?.data;

      if (!inventoryData || typeof inventoryData !== 'object' || Array.isArray(inventoryData)) {
        return json(res, 400, { success: false, error: 'Missing or invalid data payload.' });
      }

      const payload = JSON.stringify(inventoryData);
      if (Buffer.byteLength(payload, 'utf8') > 5 * 1024 * 1024) {
        return json(res, 413, { success: false, error: 'Payload exceeds the 5 MB limit.' });
      }

      const { data, error } = await supabase
        .from('inventory_sync')
        .upsert(
          {
            id: 1,
            data: inventoryData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        )
        .select('updated_at')
        .single();

      if (error) throw error;

      return json(res, 200, {
        success: true,
        message: 'Data saved successfully.',
        updatedAt: data.updated_at,
      });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return json(res, 405, { success: false, error: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/sync] Supabase error:', error);
    return json(res, 500, {
      success: false,
      error: error?.message || 'Supabase request failed.',
    });
  }
}
