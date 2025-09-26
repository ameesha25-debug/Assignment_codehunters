
// import { createClient } from "@supabase/supabase-js";

// export const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL as string,
//   import.meta.env.VITE_SUPABASE_ANON_KEY as string,
//   {
//     auth: {
//       persistSession: true,
//       autoRefreshToken: true,
//       detectSessionInUrl: true,
//     },
//   }
// );

// // Extend session TTL to 7 days
// supabase.auth.onAuthStateChange(async (event, session) => {
//   if (session) {   
//     localStorage.setItem("token", session.access_token); // optional
//   }
// });
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Extend session TTL to 7 days
const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session) {
    localStorage.setItem("token", session.access_token); // optional
  }
});

subscription.unsubscribe();