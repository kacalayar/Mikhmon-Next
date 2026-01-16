 import { prisma } from "./prisma";
 import type { MikrotikRouter, RouterConfig } from "@/types";
 
 const isVercel = process.env.VERCEL === "1" || process.env.POSTGRES_PRISMA_URL;
 
 function mapRouterFromDB(row: {
   id: string;
   name: string;
   host: string;
   port: number;
   username: string;
   password: string;
   hotspotName: string | null;
   dnsName: string | null;
   currency: string;
   autoReload: number;
   createdAt: Date;
   updatedAt: Date;
 }): MikrotikRouter {
   return {
     id: row.id,
     name: row.name,
     host: row.host,
     port: row.port,
     username: row.username,
     password: row.password,
     hotspotName: row.hotspotName || "",
     dnsName: row.dnsName || "",
     currency: row.currency,
     autoReload: row.autoReload,
     createdAt: row.createdAt.toISOString(),
     updatedAt: row.updatedAt.toISOString(),
   };
 }
 
 async function getRoutersFromFile(): Promise<MikrotikRouter[]> {
   const { promises: fs } = await import("fs");
   const path = await import("path");
   const CONFIG_PATH = path.join(process.cwd(), "data", "routers.json");
 
   try {
     const dataDir = path.dirname(CONFIG_PATH);
     try {
       await fs.access(dataDir);
     } catch {
       await fs.mkdir(dataDir, { recursive: true });
     }
 
     const data = await fs.readFile(CONFIG_PATH, "utf-8");
     const config = JSON.parse(data) as RouterConfig;
     return config.routers;
   } catch {
     const defaultConfig: RouterConfig = {
       admin: { username: "admin", password: "admin" },
       routers: [],
     };
     const dataDir = path.dirname(CONFIG_PATH);
     try {
       await fs.access(dataDir);
     } catch {
       await fs.mkdir(dataDir, { recursive: true });
     }
     await fs.writeFile(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
     return [];
   }
 }
 
 async function saveRouterToFile(routers: MikrotikRouter[]): Promise<void> {
   const { promises: fs } = await import("fs");
   const path = await import("path");
   const CONFIG_PATH = path.join(process.cwd(), "data", "routers.json");
   const config: RouterConfig = {
     admin: { username: "admin", password: "admin" },
     routers,
   };
   await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
 }
 
 export async function getRouters(): Promise<MikrotikRouter[]> {
   if (isVercel) {
     const rows = await prisma.router.findMany({ orderBy: { createdAt: "desc" } });
     return rows.map(mapRouterFromDB);
   }
   return getRoutersFromFile();
 }
 
 export async function getRouter(id: string): Promise<MikrotikRouter | null> {
   if (isVercel) {
     const row = await prisma.router.findUnique({ where: { id } });
     if (!row) return null;
     return mapRouterFromDB(row);
   }
   const routers = await getRoutersFromFile();
   return routers.find((r) => r.id === id) || null;
 }
 
 export async function addRouter(
   router: Omit<MikrotikRouter, "id" | "createdAt" | "updatedAt">
 ): Promise<MikrotikRouter> {
   if (isVercel) {
     const created = await prisma.router.create({
       data: {
         name: router.name,
         host: router.host,
         port: router.port,
         username: router.username,
         password: router.password,
         hotspotName: router.hotspotName,
         dnsName: router.dnsName,
         currency: router.currency,
         autoReload: router.autoReload,
       },
     });
     return mapRouterFromDB(created);
   }
 
   const newRouter: MikrotikRouter = {
     ...router,
     id: `router-${Date.now()}`,
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   };
   const routers = await getRoutersFromFile();
   routers.push(newRouter);
   await saveRouterToFile(routers);
   return newRouter;
 }
 
 export async function updateRouter(
   id: string,
   updates: Partial<Omit<MikrotikRouter, "id" | "createdAt">>
 ): Promise<MikrotikRouter | null> {
   if (isVercel) {
     try {
       const updated = await prisma.router.update({
         where: { id },
         data: {
           name: updates.name,
           host: updates.host,
           port: updates.port,
           username: updates.username,
           password: updates.password,
           hotspotName: updates.hotspotName,
           dnsName: updates.dnsName,
           currency: updates.currency,
           autoReload: updates.autoReload,
         },
       });
       return mapRouterFromDB(updated);
     } catch {
       return null;
     }
   }
 
   const routers = await getRoutersFromFile();
   const index = routers.findIndex((r) => r.id === id);
   if (index === -1) return null;
 
   routers[index] = { ...routers[index], ...updates, updatedAt: new Date().toISOString() };
   await saveRouterToFile(routers);
   return routers[index];
 }
 
 export async function deleteRouter(id: string): Promise<boolean> {
   if (isVercel) {
     try {
       await prisma.router.delete({ where: { id } });
       return true;
     } catch {
       return false;
     }
   }
 
   const routers = await getRoutersFromFile();
   const index = routers.findIndex((r) => r.id === id);
   if (index === -1) return false;
 
   routers.splice(index, 1);
   await saveRouterToFile(routers);
   return true;
 }
