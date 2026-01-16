import { RouterOSAPI } from "node-routeros";
import type {
  SystemResource,
  SystemIdentity,
  HotspotUser,
  HotspotUserProfile,
  HotspotActive,
  HotspotHost,
  HotspotCookie,
  HotspotIpBinding,
  HotspotServer,
  PppSecret,
  PppProfile,
  PppActive,
  DhcpLease,
  InterfaceTraffic,
} from "@/types/routeros";
import { ROUTEROS_DEFAULT_PORT, ROUTEROS_TIMEOUT } from "./constants";

interface RouterOSConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  timeout?: number;
}

class RouterOSClient {
  private api: RouterOSAPI | null = null;
  private config: RouterOSConfig | null = null;
  private initialConfig: RouterOSConfig | null = null;

  constructor(config?: RouterOSConfig) {
    if (config) {
      this.initialConfig = config;
    }
  }

  async connect(config?: RouterOSConfig): Promise<boolean> {
    const cfg = config || this.initialConfig;
    if (!cfg) {
      throw new Error("No config provided");
    }

    this.config = {
      ...cfg,
      port: cfg.port || ROUTEROS_DEFAULT_PORT,
      timeout: cfg.timeout || ROUTEROS_TIMEOUT,
    };

    this.api = new RouterOSAPI({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      timeout: this.config.timeout,
    });

    try {
      await this.api.connect();
      console.log("RouterOS connected successfully:", {
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
      });
      return true;
    } catch (error) {
      console.error("RouterOS connection error:", {
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      this.api = null;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.close();
      this.api = null;
    }
  }

  isConnected(): boolean {
    return this.api !== null;
  }

  async write<T = Record<string, unknown>>(
    command: string,
    params: string[] = [],
  ): Promise<T[]> {
    if (!this.api) {
      throw new Error("Not connected to RouterOS");
    }
    const result = await this.api.write(command, params);
    return result as T[];
  }

  // System commands
  async getSystemIdentity(): Promise<SystemIdentity> {
    const result = await this.write<SystemIdentity>("/system/identity/print");
    return result[0];
  }

  async getSystemResource(): Promise<SystemResource> {
    const result = await this.write<SystemResource>("/system/resource/print");
    return result[0];
  }

  async reboot(): Promise<void> {
    await this.write("/system/reboot");
  }

  async shutdown(): Promise<void> {
    await this.write("/system/shutdown");
  }

  // Hotspot Users
  async getHotspotUsers(filters?: string[]): Promise<HotspotUser[]> {
    return this.write<HotspotUser>("/ip/hotspot/user/print", filters);
  }

  async addHotspotUser(user: Partial<HotspotUser>): Promise<{ ret: string }[]> {
    const params = Object.entries(user)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `=${k}=${v}`);
    return this.write("/ip/hotspot/user/add", params);
  }

  async updateHotspotUser(
    id: string,
    user: Partial<HotspotUser>,
  ): Promise<void> {
    const params = [
      `=.id=${id}`,
      ...Object.entries(user)
        .filter(([k, v]) => k !== ".id" && v !== undefined)
        .map(([k, v]) => `=${k}=${v}`),
    ];
    await this.write("/ip/hotspot/user/set", params);
  }

  async removeHotspotUser(id: string): Promise<void> {
    await this.write("/ip/hotspot/user/remove", [`=.id=${id}`]);
  }

  async enableHotspotUser(id: string): Promise<void> {
    await this.write("/ip/hotspot/user/enable", [`=.id=${id}`]);
  }

  async disableHotspotUser(id: string): Promise<void> {
    await this.write("/ip/hotspot/user/disable", [`=.id=${id}`]);
  }

  async resetHotspotUser(id: string): Promise<void> {
    await this.write("/ip/hotspot/user/reset-counters", [`=.id=${id}`]);
  }

  // Hotspot User Profiles
  async getHotspotUserProfiles(): Promise<HotspotUserProfile[]> {
    return this.write<HotspotUserProfile>("/ip/hotspot/user/profile/print");
  }

  async addHotspotUserProfile(
    profile: Partial<HotspotUserProfile>,
  ): Promise<{ ret: string }[]> {
    const params = Object.entries(profile)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `=${k}=${v}`);
    return this.write("/ip/hotspot/user/profile/add", params);
  }

  async updateHotspotUserProfile(
    id: string,
    profile: Partial<HotspotUserProfile>,
  ): Promise<void> {
    const params = [
      `=.id=${id}`,
      ...Object.entries(profile)
        .filter(([k, v]) => k !== ".id" && v !== undefined)
        .map(([k, v]) => `=${k}=${v}`),
    ];
    await this.write("/ip/hotspot/user/profile/set", params);
  }

  async removeHotspotUserProfile(id: string): Promise<void> {
    await this.write("/ip/hotspot/user/profile/remove", [`=.id=${id}`]);
  }

  // Hotspot Active
  async getHotspotActive(server?: string): Promise<HotspotActive[]> {
    const filters = server ? [`?server=${server}`] : undefined;
    return this.write<HotspotActive>("/ip/hotspot/active/print", filters);
  }

  async removeHotspotActive(id: string): Promise<void> {
    await this.write("/ip/hotspot/active/remove", [`=.id=${id}`]);
  }

  // Hotspot Hosts
  async getHotspotHosts(): Promise<HotspotHost[]> {
    return this.write<HotspotHost>("/ip/hotspot/host/print");
  }

  async removeHotspotHost(id: string): Promise<void> {
    await this.write("/ip/hotspot/host/remove", [`=.id=${id}`]);
  }

  // Hotspot Cookies
  async getHotspotCookies(): Promise<HotspotCookie[]> {
    return this.write<HotspotCookie>("/ip/hotspot/cookie/print");
  }

  async removeHotspotCookie(id: string): Promise<void> {
    await this.write("/ip/hotspot/cookie/remove", [`=.id=${id}`]);
  }

  // Hotspot IP Binding
  async getHotspotIpBindings(): Promise<HotspotIpBinding[]> {
    return this.write<HotspotIpBinding>("/ip/hotspot/ip-binding/print");
  }

  async addHotspotIpBinding(
    binding: Partial<HotspotIpBinding>,
  ): Promise<{ ret: string }[]> {
    const params = Object.entries(binding)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `=${k}=${v}`);
    return this.write("/ip/hotspot/ip-binding/add", params);
  }

  async removeHotspotIpBinding(id: string): Promise<void> {
    await this.write("/ip/hotspot/ip-binding/remove", [`=.id=${id}`]);
  }

  async enableHotspotIpBinding(id: string): Promise<void> {
    await this.write("/ip/hotspot/ip-binding/enable", [`=.id=${id}`]);
  }

  async disableHotspotIpBinding(id: string): Promise<void> {
    await this.write("/ip/hotspot/ip-binding/disable", [`=.id=${id}`]);
  }

  // Hotspot Servers
  async getHotspotServers(): Promise<HotspotServer[]> {
    return this.write<HotspotServer>("/ip/hotspot/print");
  }

  // PPP Secrets
  async getPppSecrets(): Promise<PppSecret[]> {
    return this.write<PppSecret>("/ppp/secret/print");
  }

  async addPppSecret(secret: Partial<PppSecret>): Promise<{ ret: string }[]> {
    const params = Object.entries(secret)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `=${k}=${v}`);
    return this.write("/ppp/secret/add", params);
  }

  async updatePppSecret(id: string, secret: Partial<PppSecret>): Promise<void> {
    const params = [
      `=.id=${id}`,
      ...Object.entries(secret)
        .filter(([k, v]) => k !== ".id" && v !== undefined)
        .map(([k, v]) => `=${k}=${v}`),
    ];
    await this.write("/ppp/secret/set", params);
  }

  async removePppSecret(id: string): Promise<void> {
    await this.write("/ppp/secret/remove", [`=.id=${id}`]);
  }

  async enablePppSecret(id: string): Promise<void> {
    await this.write("/ppp/secret/enable", [`=.id=${id}`]);
  }

  async disablePppSecret(id: string): Promise<void> {
    await this.write("/ppp/secret/disable", [`=.id=${id}`]);
  }

  // PPP Profiles
  async getPppProfiles(): Promise<PppProfile[]> {
    return this.write<PppProfile>("/ppp/profile/print");
  }

  async addPppProfile(
    profile: Partial<PppProfile>,
  ): Promise<{ ret: string }[]> {
    const params = Object.entries(profile)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `=${k}=${v}`);
    return this.write("/ppp/profile/add", params);
  }

  async removePppProfile(id: string): Promise<void> {
    await this.write("/ppp/profile/remove", [`=.id=${id}`]);
  }

  // PPP Active
  async getPppActive(): Promise<PppActive[]> {
    return this.write<PppActive>("/ppp/active/print");
  }

  async removePppActive(id: string): Promise<void> {
    await this.write("/ppp/active/remove", [`=.id=${id}`]);
  }

  // DHCP Leases
  async getDhcpLeases(): Promise<DhcpLease[]> {
    return this.write<DhcpLease>("/ip/dhcp-server/lease/print");
  }

  // Interface / Traffic
  async getInterfaceTraffic(interfaceName: string): Promise<InterfaceTraffic> {
    const result = await this.write<InterfaceTraffic>("/interface/print", [
      `?name=${interfaceName}`,
    ]);
    return result[0];
  }

  // Log
  async getLog(
    limit = 50,
  ): Promise<{ time: string; topics: string; message: string }[]> {
    return this.write("/log/print", [`=limit=${limit}`]);
  }
}

// Export singleton-like factory function
export function createRouterOSClient(config?: RouterOSConfig): RouterOSClient {
  return new RouterOSClient(config);
}

export type { RouterOSConfig };
