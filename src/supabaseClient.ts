
import { createClient } from '@supabase/supabase-js';

// 安全性提醒：
// 建議將這些資訊設定在您的部署環境變數中 (Environment Variables)。
// 在前端應用程式中，這些資訊最終仍會傳送到瀏覽器，因此請確保您的 Supabase 
// 資料庫已啟動 RLS (Row Level Security) 來保護資料安全性。

// Vite 使用 import.meta.env 來讀取環境變數，而非 process.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
