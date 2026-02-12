
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lqgjishzmagpzuvegyav.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZ2ppc2h6bWFncHp1dmVneWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2Mjc3MzIsImV4cCI6MjA4NjIwMzczMn0.j0_GvBoXF6l57sENZZWL46aWbI0hvL6dzQ-HbWFSM_s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
