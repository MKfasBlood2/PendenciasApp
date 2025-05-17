
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://phboxjadyrjjjflblhcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYm94amFkeXJqampmbGJsaGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMjQ5MjEsImV4cCI6MjA2MjcwMDkyMX0.JZ1gbZ5mNcXnkFsBJ3eWJE4ioYZ_kZ__xkMXOHaqslM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
