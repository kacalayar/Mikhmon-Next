// Application Constants

export const APP_NAME = "Mikhmon Next";
export const APP_VERSION = "1.0.0";

// RouterOS API default settings
export const ROUTEROS_DEFAULT_PORT = 8728;
export const ROUTEROS_SSL_PORT = 8729;
export const ROUTEROS_TIMEOUT = 5000;
export const ROUTEROS_ATTEMPTS = 3;

// Session storage keys
export const STORAGE_KEYS = {
  SESSIONS: "mikhmon_sessions",
  ACTIVE_SESSION: "mikhmon_active_session",
  THEME: "mikhmon_theme",
  LANGUAGE: "mikhmon_language",
} as const;

// Navigation menu items
export const NAV_ITEMS = {
  DASHBOARD: { title: "Dashboard", href: "/", icon: "LayoutDashboard" },
  HOTSPOT: {
    title: "Hotspot",
    items: [
      { title: "Users", href: "/hotspot/users", icon: "Users" },
      { title: "User Profiles", href: "/hotspot/profiles", icon: "UserCog" },
      { title: "Active", href: "/hotspot/active", icon: "Radio" },
      { title: "Hosts", href: "/hotspot/hosts", icon: "Server" },
      { title: "Cookies", href: "/hotspot/cookies", icon: "Cookie" },
      { title: "IP Binding", href: "/hotspot/ip-binding", icon: "Link" },
    ],
  },
  PPP: {
    title: "PPP",
    items: [
      { title: "Secrets", href: "/ppp/secrets", icon: "KeyRound" },
      { title: "Profiles", href: "/ppp/profiles", icon: "Settings" },
      { title: "Active", href: "/ppp/active", icon: "Activity" },
    ],
  },
  DHCP: { title: "DHCP Leases", href: "/dhcp", icon: "Network" },
  REPORTS: {
    title: "Reports",
    items: [
      { title: "Selling", href: "/reports/selling", icon: "DollarSign" },
      { title: "User Log", href: "/reports/user-log", icon: "FileText" },
    ],
  },
  VOUCHER: { title: "Voucher", href: "/voucher", icon: "Ticket" },
  SETTINGS: { title: "Settings", href: "/settings", icon: "Settings" },
} as const;

// Table page sizes
export const PAGE_SIZES = [10, 25, 50, 100] as const;

// Voucher templates
export const VOUCHER_SIZES = {
  DEFAULT: { width: 200, height: 120 },
  SMALL: { width: 150, height: 80 },
  THERMAL: { width: 58, height: "auto" },
} as const;
