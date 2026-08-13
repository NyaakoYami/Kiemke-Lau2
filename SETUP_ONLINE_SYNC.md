/\*\*

- SETUP GUIDE for Kiemke-Lau2 Online Sync
-
- OPTION 1: Using Supabase (Recommended)
- =====================================
-
- 1.  Create Supabase Project:
- - Go to https://supabase.com
- - Sign up (free tier)
- - Create new project
- - Get API URL and anon key
-
- 2.  Create Table in Supabase:
- SQL Query to run in Supabase SQL Editor:
-
- CREATE TABLE IF NOT EXISTS inventory_data (
-      id BIGSERIAL PRIMARY KEY,
-      key TEXT UNIQUE NOT NULL,
-      data JSONB NOT NULL,
-      updated_at TIMESTAMP DEFAULT NOW(),
-      updated_by TEXT
- );
-
- CREATE INDEX idx_key ON inventory_data(key);
-
- 3.  Update index.html:
- - Replace SUPABASE_URL and SUPABASE_KEY in the script
- - Update syncOnline() and loadOnline() functions
-
- 4.  Deploy to Vercel:
- git push to trigger deployment
-
-
- OPTION 2: Using Vercel KV (If you have Vercel Pro)
- ===================================================
-
- 1.  Enable KV in Vercel Dashboard
- 2.  Add to vercel.json:
- {
-      "env": {
-        "KV_URL": "@kv-url",
-        "KV_REST_API_URL": "@kv-rest-api-url",
-        "KV_REST_API_TOKEN": "@kv-rest-api-token"
-      }
- }
-
-
- Current Implementation:
- ========================
- The current /api/sync.js uses in-memory storage (temporary, will reset on deploy)
-
- To make it persistent:
- 1.  Replace with Supabase integration (recommended)
- 2.  Or setup Vercel KV
- 3.  Or use a dedicated database
- \*/

// TODO: Configure these after setting up Supabase
const SUPABASE_CONFIG = {
url: 'YOUR_SUPABASE_URL', // e.g., https://xxx.supabase.co
key: 'YOUR_SUPABASE_ANON_KEY', // anon key from Supabase
table: 'inventory_data'
};

// Uncomment and use this after configuring Supabase
/\*
export async function supabaseSync(data) {
const { url, key, table } = SUPABASE_CONFIG;

try {
const response = await fetch(`${url}/rest/v1/${table}`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'apikey': key,
'Authorization': `Bearer ${key}`
},
body: JSON.stringify({
key: 'inventory_main',
data: data
})
});

    return await response.json();

} catch (error) {
console.error('Supabase sync error:', error);
throw error;
}
}
\*/
