// Supabase configuration
const SUPABASE_URL = 'https://ojktxinhtvnpqntxiyhz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qa3R4aW5odHZucHFudHhpeWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQwMzEsImV4cCI6MjA4MTU0MDAzMX0.PDVZkLr_f_rG5kgRkbpBzrsvQgiJk3C7kJgw4txiHMU';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabaseClient };
