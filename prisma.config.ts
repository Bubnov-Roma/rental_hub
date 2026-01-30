import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

if (!databaseUrl || !directUrl) {
  throw new Error("DATABASE_URL or DIRECT_URL is missing in .env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
   url: directUrl,
  },
});
