 import { PrismaClient } from "@prisma/client";
 import { PrismaPg } from "@prisma/adapter-pg";
 
 const globalForPrisma = globalThis as unknown as {
   prisma: PrismaClient | undefined;
 };
 
 function createPrismaClient(): PrismaClient {
   const url = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
   if (!url) {
     // Return a mock client that throws on use - Prisma not configured
     return new Proxy({} as PrismaClient, {
       get() {
         throw new Error("Prisma not configured - DATABASE_URL not set");
       },
     });
   }
   const adapter = new PrismaPg({ connectionString: url });
   return new PrismaClient({ adapter });
 }
 
 export const prisma = globalForPrisma.prisma ?? createPrismaClient();
 
 if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
