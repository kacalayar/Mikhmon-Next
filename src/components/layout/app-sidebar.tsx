 "use client";
 
 import * as React from "react";
 import Link from "next/link";
 import { usePathname } from "next/navigation";
 import {
   LayoutDashboard,
   Users,
   UserPlus,
   UserCog,
   Radio,
   Wifi,
   Server,
   Cookie,
   Link as LinkIcon,
   Laptop,
   KeyRound,
   Settings,
   Activity,
   Network,
   DollarSign,
   FileText,
   Ticket,
   ChevronDown,
   Printer,
   Clock,
   Power,
   AreaChart,
   Upload,
   Edit,
   Info,
   List,
   PlusSquare,
 } from "lucide-react";
 
 import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSub,
   SidebarMenuSubItem,
   SidebarMenuSubButton,
 } from "@/components/ui/sidebar";
 import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
 } from "@/components/ui/collapsible";
 import { APP_NAME } from "@/lib/constants";
 
 type MenuItem = {
   title: string;
   href?: string;
   icon: React.ComponentType<{ className?: string }>;
   items?: {
     title: string;
     href: string;
     icon: React.ComponentType<{ className?: string }>;
   }[];
 };
 
 const menuItems: MenuItem[] = [
   { title: "Dashboard", href: "/", icon: LayoutDashboard },
   {
     title: "Hotspot",
     icon: Wifi,
     items: [
       { title: "User List", href: "/hotspot/users", icon: List },
       { title: "Add User", href: "/hotspot/users/add", icon: UserPlus },
       { title: "Generate", href: "/hotspot/users/generate", icon: UserPlus },
       { title: "User Profiles", href: "/hotspot/profiles", icon: UserCog },
       { title: "Add Profile", href: "/hotspot/profiles/add", icon: PlusSquare },
       { title: "Active", href: "/hotspot/active", icon: Radio },
       { title: "Hosts", href: "/hotspot/hosts", icon: Laptop },
       { title: "IP Bindings", href: "/hotspot/ip-binding", icon: LinkIcon },
       { title: "Cookies", href: "/hotspot/cookies", icon: Cookie },
     ],
   },
   { title: "Quick Print", href: "/quick-print", icon: Printer },
   { title: "Vouchers", href: "/vouchers", icon: Ticket },
   {
     title: "Log",
     icon: FileText,
     items: [
       { title: "Hotspot Log", href: "/log/hotspot", icon: Wifi },
       { title: "User Log", href: "/log/user", icon: Users },
     ],
   },
   {
     title: "System",
     icon: Settings,
     items: [
       { title: "Scheduler", href: "/system/scheduler", icon: Clock },
       { title: "Reboot", href: "/system/reboot", icon: Power },
       { title: "Shutdown", href: "/system/shutdown", icon: Power },
     ],
   },
   {
     title: "PPP",
     icon: KeyRound,
     items: [
       { title: "Secrets", href: "/ppp/secrets", icon: KeyRound },
       { title: "Profiles", href: "/ppp/profiles", icon: Settings },
       { title: "Active", href: "/ppp/active", icon: Activity },
     ],
   },
   { title: "DHCP Leases", href: "/dhcp", icon: Network },
   { title: "Traffic Monitor", href: "/traffic", icon: AreaChart },
   { title: "Report", href: "/report", icon: DollarSign },
   {
     title: "Settings",
     icon: Settings,
     items: [
       { title: "Session Settings", href: "/settings/session", icon: Settings },
       { title: "Admin Settings", href: "/sessions", icon: Settings },
       { title: "Upload Logo", href: "/settings/logo", icon: Upload },
       { title: "Template Editor", href: "/settings/template", icon: Edit },
     ],
   },
   { title: "About", href: "/about", icon: Info },
 ];
 
 export function AppSidebar() {
   const pathname = usePathname();
 
   return (
     <Sidebar>
       <SidebarHeader className="h-14 justify-center border-b px-4">
         <Link href="/" className="flex items-center gap-2 font-semibold">
           <Server className="h-6 w-6" />
           <span>{APP_NAME}</span>
         </Link>
       </SidebarHeader>
       <SidebarContent>
         <SidebarGroup>
           <SidebarGroupContent>
             <SidebarMenu>
               {menuItems.map((item) =>
                 item.items ? (
                   <Collapsible key={item.title} className="group/collapsible">
                     <SidebarMenuItem>
                       <CollapsibleTrigger asChild>
                         <SidebarMenuButton>
                           <item.icon className="h-4 w-4" />
                           <span>{item.title}</span>
                           <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                         </SidebarMenuButton>
                       </CollapsibleTrigger>
                       <CollapsibleContent>
                         <SidebarMenuSub>
                           {item.items.map((subItem) => (
                             <SidebarMenuSubItem key={subItem.href}>
                               <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                 <Link href={subItem.href}>
                                   <subItem.icon className="h-4 w-4" />
                                   <span>{subItem.title}</span>
                                 </Link>
                               </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                           ))}
                         </SidebarMenuSub>
                       </CollapsibleContent>
                     </SidebarMenuItem>
                   </Collapsible>
                 ) : (
                   <SidebarMenuItem key={item.href}>
                     <SidebarMenuButton asChild isActive={pathname === item.href}>
                       <Link href={item.href!}>
                         <item.icon className="h-4 w-4" />
                         <span>{item.title}</span>
                       </Link>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                 )
               )}
             </SidebarMenu>
           </SidebarGroupContent>
         </SidebarGroup>
       </SidebarContent>
       <SidebarFooter className="border-t p-4">
         <p className="text-xs text-muted-foreground">Mikhmon Next v1.0.0</p>
       </SidebarFooter>
     </Sidebar>
   );
 }
