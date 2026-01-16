 import { sql } from "@vercel/postgres";
import type { MikrotikRouter, RouterConfig } from "@/types";

 const isVercel = process.env.VERCEL === "1" || process.env.POSTGRES_URL;

 async function ensureTable() {
   if (!isVercel) return;
  try {
     await sql`
       CREATE TABLE IF NOT EXISTS routers (
         id VARCHAR(255) PRIMARY KEY,
         name VARCHAR(255) NOT NULL,
         host VARCHAR(255) NOT NULL,
         port INTEGER DEFAULT 8728,
         username VARCHAR(255) NOT NULL,
         password VARCHAR(255) NOT NULL,
         hotspot_name VARCHAR(255),
         dns_name VARCHAR(255),
         currency VARCHAR(50) DEFAULT 'Rp',
         auto_reload INTEGER DEFAULT 10,
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
       )
     `;
     await sql`
       CREATE TABLE IF NOT EXISTS admin_config (
         id SERIAL PRIMARY KEY,
         username VARCHAR(255) NOT NULL,
         password VARCHAR(255) NOT NULL
       )
     `;
     const { rowCount } = await sql`SELECT * FROM admin_config LIMIT 1`;
     if (rowCount === 0) {
       await sql`INSERT INTO admin_config (username, password) VALUES ('admin', 'admin')`;
     }
   } catch (error) {
     console.error("Failed to ensure table:", error);
  }
}

 async function getRoutersFromDB(): Promise<MikrotikRouter[]> {
   await ensureTable();
   const { rows } = await sql`SELECT * FROM routers ORDER BY created_at DESC`;
   return rows.map((row) => ({
     id: row.id,
     name: row.name,
     host: row.host,
     port: row.port,
     username: row.username,
     password: row.password,
     hotspotName: row.hotspot_name || "",
     dnsName: row.dns_name || "",
     currency: row.currency || "Rp",
     autoReload: row.auto_reload || 10,
     createdAt: row.created_at?.toISOString() || new Date().toISOString(),
     updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
   }));
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
     try { await fs.access(dataDir); } catch { await fs.mkdir(dataDir, { recursive: true }); }
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
     return getRoutersFromDB();
   }
   return getRoutersFromFile();
}

export async function getRouter(id: string): Promise<MikrotikRouter | null> {
   if (isVercel) {
     await ensureTable();
     const { rows } = await sql`SELECT * FROM routers WHERE id = ${id}`;
     if (rows.length === 0) return null;
     const row = rows[0];
     return {
       id: row.id,
       name: row.name,
       host: row.host,
       port: row.port,
       username: row.username,
       password: row.password,
       hotspotName: row.hotspot_name || "",
       dnsName: row.dns_name || "",
       currency: row.currency || "Rp",
       autoReload: row.auto_reload || 10,
       createdAt: row.created_at?.toISOString() || new Date().toISOString(),
       updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
     };
   }
   const routers = await getRoutersFromFile();
   return routers.find((r) => r.id === id) || null;
}

export async function addRouter(
  router: Omit<MikrotikRouter, "id" | "createdAt" | "updatedAt">,
): Promise<MikrotikRouter> {
  const newRouter: MikrotikRouter = {
    ...router,
    id: `router-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
   
   if (isVercel) {
     await ensureTable();
     await sql`
       INSERT INTO routers (id, name, host, port, username, password, hotspot_name, dns_name, currency, auto_reload)
       VALUES (${newRouter.id}, ${newRouter.name}, ${newRouter.host}, ${newRouter.port}, 
               ${newRouter.username}, ${newRouter.password}, ${newRouter.hotspotName}, 
               ${newRouter.dnsName}, ${newRouter.currency}, ${newRouter.autoReload})
     `;
   } else {
     const routers = await getRoutersFromFile();
     routers.push(newRouter);
     await saveRouterToFile(routers);
   }
  return newRouter;
}

export async function updateRouter(
  id: string,
  updates: Partial<Omit<MikrotikRouter, "id" | "createdAt">>,
): Promise<MikrotikRouter | null> {
   if (isVercel) {
     await ensureTable();
     const existing = await getRouter(id);
     if (!existing) return null;
     
     const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
     await sql`
       UPDATE routers SET
         name = ${updated.name},
         host = ${updated.host},
         port = ${updated.port},
         username = ${updated.username},
         password = ${updated.password},
         hotspot_name = ${updated.hotspotName},
         dns_name = ${updated.dnsName},
         currency = ${updated.currency},
         auto_reload = ${updated.autoReload},
         updated_at = NOW()
       WHERE id = ${id}
     `;
     return updated;
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
     await ensureTable();
     const { rowCount } = await sql`DELETE FROM routers WHERE id = ${id}`;
     return (rowCount ?? 0) > 0;
   }
   
   const routers = await getRoutersFromFile();
   const index = routers.findIndex((r) => r.id === id);
   if (index === -1) return false;
   
   routers.splice(index, 1);
   await saveRouterToFile(routers);
   return true;
}
