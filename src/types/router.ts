export interface MikrotikRouter {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  hotspotName: string;
  dnsName: string;
  currency: string;
  autoReload: number;
  createdAt: string;
  updatedAt: string;
}

export interface RouterConfig {
  admin: {
    username: string;
    password: string;
  };
  routers: MikrotikRouter[];
}
