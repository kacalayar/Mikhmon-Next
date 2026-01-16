// RouterOS API Types

export interface RouterSession {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
}

export interface SystemResource {
  uptime: string;
  version: string;
  "build-time": string;
  "cpu-load": string;
  "free-memory": string;
  "total-memory": string;
  "free-hdd-space": string;
  "total-hdd-space": string;
  "architecture-name": string;
  "board-name": string;
  platform: string;
}

export interface SystemIdentity {
  name: string;
}

export interface HotspotUser {
  ".id": string;
  name: string;
  password?: string;
  profile: string;
  "mac-address"?: string;
  "limit-uptime"?: string;
  "limit-bytes-in"?: string;
  "limit-bytes-out"?: string;
  "limit-bytes-total"?: string;
  uptime?: string;
  "bytes-in"?: string;
  "bytes-out"?: string;
  comment?: string;
  disabled?: string;
}

export interface HotspotUserProfile {
  ".id": string;
  name: string;
  "shared-users"?: string;
  "rate-limit"?: string;
  "session-timeout"?: string;
  "idle-timeout"?: string;
  "keepalive-timeout"?: string;
  "status-autorefresh"?: string;
  "transparent-proxy"?: string;
  "address-pool"?: string;
  "parent-queue"?: string;
}

export interface HotspotActive {
  ".id": string;
  user: string;
  address: string;
  "mac-address": string;
  "login-by": string;
  uptime: string;
  "session-time-left"?: string;
  "idle-time": string;
  "bytes-in": string;
  "bytes-out": string;
  server: string;
}

export interface HotspotHost {
  ".id": string;
  "mac-address": string;
  address: string;
  "to-address"?: string;
  server: string;
  authorized?: string;
  bypassed?: string;
  comment?: string;
}

export interface HotspotCookie {
  ".id": string;
  user: string;
  "mac-address": string;
  domain: string;
  expires: string;
}

export interface HotspotIpBinding {
  ".id": string;
  "mac-address"?: string;
  address?: string;
  "to-address"?: string;
  server?: string;
  type: string;
  disabled?: string;
  comment?: string;
}

export interface PppSecret {
  ".id": string;
  name: string;
  password?: string;
  service: string;
  profile: string;
  "local-address"?: string;
  "remote-address"?: string;
  "caller-id"?: string;
  disabled?: string;
  comment?: string;
}

export interface PppProfile {
  ".id": string;
  name: string;
  "local-address"?: string;
  "remote-address"?: string;
  "rate-limit"?: string;
  "only-one"?: string;
  bridge?: string;
}

export interface PppActive {
  ".id": string;
  name: string;
  service: string;
  "caller-id": string;
  address: string;
  uptime: string;
  encoding: string;
  "session-id": string;
}

export interface DhcpLease {
  ".id": string;
  address: string;
  "mac-address": string;
  "host-name"?: string;
  server: string;
  status: string;
  "last-seen"?: string;
  "expires-after"?: string;
  "active-address"?: string;
  comment?: string;
}

export interface HotspotServer {
  ".id": string;
  name: string;
  interface: string;
  "address-pool": string;
  profile: string;
  disabled: string;
}

export interface InterfaceTraffic {
  name: string;
  "rx-byte": string;
  "tx-byte": string;
  "rx-packet": string;
  "tx-packet": string;
}
