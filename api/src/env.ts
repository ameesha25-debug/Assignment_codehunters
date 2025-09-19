import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT ?? 4000),
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret",
  BASE_URL: process.env.BASE_URL ?? "http://localhost:4000",
  DB_URL: process.env.DATABASE_URL || ""
};
