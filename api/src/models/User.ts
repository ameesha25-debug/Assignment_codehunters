export interface User {
  id: string;                // Supabase UUID or text id
  mobile: string;            // unique mobile number
  password_hash: string;     // argon/bcrypt hash
  name?: string | null;      // optional display name
  credit_balance?: number | null; // wallet/credit for header menu
  created_at?: string;       // timestamp
  avatar_url?: string | null;
}
