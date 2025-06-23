import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odwqwwbinkjbmvebnjmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kd3F3d2JpbmtqYm12ZWJuam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODEzNTAsImV4cCI6MjA2NTg1NzM1MH0._CxfUX8kEaCoznwuawOf4Ikc74uN6SmfDVcs5BveFEA';

export const supabase = createClient(supabaseUrl, supabaseKey);
