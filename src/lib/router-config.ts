import { promises as fs } from "fs";
import path from "path";
import type { MikrotikRouter, RouterConfig } from "@/types";

const CONFIG_PATH = path.join(process.cwd(), "data", "routers.json");

async function ensureDataDir() {
  const dataDir = path.dirname(CONFIG_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readConfig(): Promise<RouterConfig> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    const defaultConfig: RouterConfig = {
      admin: {
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "admin",
      },
      routers: [],
    };
    await fs.writeFile(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
}

async function writeConfig(config: RouterConfig): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function getRouters(): Promise<MikrotikRouter[]> {
  const config = await readConfig();
  return config.routers;
}

export async function getRouter(id: string): Promise<MikrotikRouter | null> {
  const config = await readConfig();
  return config.routers.find((r) => r.id === id) || null;
}

export async function addRouter(
  router: Omit<MikrotikRouter, "id" | "createdAt" | "updatedAt">,
): Promise<MikrotikRouter> {
  const config = await readConfig();
  const newRouter: MikrotikRouter = {
    ...router,
    id: `router-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  config.routers.push(newRouter);
  await writeConfig(config);
  return newRouter;
}

export async function updateRouter(
  id: string,
  updates: Partial<Omit<MikrotikRouter, "id" | "createdAt">>,
): Promise<MikrotikRouter | null> {
  const config = await readConfig();
  const index = config.routers.findIndex((r) => r.id === id);
  if (index === -1) return null;

  config.routers[index] = {
    ...config.routers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writeConfig(config);
  return config.routers[index];
}

export async function deleteRouter(id: string): Promise<boolean> {
  const config = await readConfig();
  const index = config.routers.findIndex((r) => r.id === id);
  if (index === -1) return false;

  config.routers.splice(index, 1);
  await writeConfig(config);
  return true;
}
