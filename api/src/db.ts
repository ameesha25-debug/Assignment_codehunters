import { Pool } from "pg";
import { ENV } from "./env";

// Add this line right here, before using the value
console.log(
  "PG rejectUnauthorized =",
  process.env.PGSSL_REJECT_UNAUTHORIZED,
  "→",
  process.env.PGSSL_REJECT_UNAUTHORIZED !== "false"
);


const reject = process.env.PGSSL_REJECT_UNAUTHORIZED !== "false";
export const pool = new Pool({
    
  connectionString: ENV.DB_URL,
  ssl: { rejectUnauthorized: reject }
});
