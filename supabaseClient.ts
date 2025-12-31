import { createClient } from '@supabase/supabase-js';

// 使用您提供的原始 Supabase URL 和 Key
const SUPABASE_URL = "https://yvacvzulhaaehffbhttt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YWN2enVsaGFhZWhmZmJodHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTg1ODUsImV4cCI6MjA4MTQ3NDU4NX0.6tgcZoxClNCn9y5lft_H1XF2pfQGPb6beehSuQLEMD0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
