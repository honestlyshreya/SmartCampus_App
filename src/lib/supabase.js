import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Live Supabase Project Credentials
export const SUPABASE_URL = 'https://efosulvzrfjqqrbyentz.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_Uf5xSO4tIP0Kjvj_pWssRw_qgOhcNe8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
