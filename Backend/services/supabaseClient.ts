import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SUPABASE_URL = "https://nbgxgzwaesdwvsgbasux.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZ3hnendhZXNkd3ZzZ2Jhc3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTMzODIsImV4cCI6MjA4Mzc2OTM4Mn0.MRlVm-vDDOE0brdpNe4D3PDIlDNBAozPOtHIGZQuF4A";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // IMPORTANTE para React Native
    },
  }
);
