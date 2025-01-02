import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase/tables';

const SUPABASE_URL = "https://tyyucvvapqwzjkqcgjwb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5eXVjdnZhcHF3emprcWNnandiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTU3MDQsImV4cCI6MjA0OTA3MTcwNH0.lqkWqGw-XBMDogEziPeGo6xViURec5i5xTxp8pu8ooo";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);