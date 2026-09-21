import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: Number(process.env.PORT) || 5000,
};