import { createClient } from '@supabase/supabase-js';

// Bu değerler .env.local dosyasından okunacaktır.
// Sen projeyi açıp bana değerleri verdiğinde buraya entegre edeceğiz.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
