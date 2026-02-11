const { createClient } = require('@supabase/supabase-js');

// Config from your local .env (hardcoded for verification)
const supabaseUrl = "https://lqgjishzmagpzuvegyav.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZ2ppc2h6bWFncHp1dmVneWF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyNzczMiwiZXhwIjoyMDg2MjAzNzMyfQ.e44d-hgLZwGWFTvvLG91q-RND2vx6v11i7zK5W7mrqM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing connection...");
    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) {
        console.error("❌ Connection Failed:", error.message);
    } else {
        console.log("✅ Connection Successful!");
        console.log("Data:", data);
    }
}

testConnection();
