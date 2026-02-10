require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing connection to:", supabaseUrl);

    // Test 1: List all users (limit 1)
    console.log("Attempting to fetch users...");
    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) {
        console.error("Error fetching users:", error);
    } else {
        console.log("Success fetching users:", data);
    }

    // Test 2: Insert dummy user
    console.log("Attempting to insert test user...");
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        mobile: '1234567890',
        verified: false
    };

    // We use upsert to avoid duplicate key errors if run multiple times
    const { data: insertData, error: insertError } = await supabase
        .from('users')
        .upsert(testUser, { onConflict: 'mobile' })
        .select();

    if (insertError) {
        console.error("Error inserting user:", insertError);
    } else {
        console.log("Success inserting user:", insertData);
    }
}

testConnection();
