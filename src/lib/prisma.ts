import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const adapter = new PrismaMariaDb({
	host: process.env.DATABASE_HOST as string,
	user: process.env.DATABASE_USER as string,
	password: process.env.DATABASE_PASSWORD as string,
	database: process.env.DATABASE_NAME as string,
	connectionLimit: 5,
});

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
