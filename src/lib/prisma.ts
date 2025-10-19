import { PrismaClient } from "@prisma/client";

const prismaGlobal = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const createClient = () => new PrismaClient();

const prismaClient = prismaGlobal.prisma ?? createClient();
const isProduction = process.env["NODE_ENV"] === "production";

if (!isProduction) {
  prismaGlobal.prisma = prismaClient;
}

export const prisma = prismaClient;
