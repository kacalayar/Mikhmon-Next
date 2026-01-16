 "use client";
 
 import Link from "next/link";
 import { usePathname } from "next/navigation";
 import { Settings, Plus, Info, LogOut, Server } from "lucide-react";
 import { signOut } from "next-auth/react";
 import { Button } from "@/components/ui/button";
 import { APP_NAME } from "@/lib/constants";
 
 const menuItems = [
   { title: "Admin Settings", href: "/sessions", icon: Settings },
   { title: "Add Router", href: "/router/new", icon: Plus },
   { title: "About", href: "/about", icon: Info },
 ];
 
 export function AdminSidebar() {
   const pathname = usePathname();
 
   return (
     <div className="flex w-64 flex-col border-r bg-card">
       <div className="border-b px-4">
         <Link href="/sessions" className="flex h-14 items-center gap-2 font-semibold">
           <Server className="h-6 w-6" />
           <span>{APP_NAME}</span>
         </Link>
       </div>
       <nav className="flex-1 p-2">
         {menuItems.map((item) => (
           <Link
             key={item.href}
             href={item.href}
             className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
               pathname === item.href ? "bg-accent font-medium" : ""
             }`}
           >
             <item.icon className="h-4 w-4" />
             {item.title}
           </Link>
         ))}
       </nav>
       <div className="border-t p-2">
         <Button
           variant="ghost"
           className="w-full justify-start"
           onClick={() => signOut({ callbackUrl: "/login" })}
         >
           <LogOut className="mr-2 h-4 w-4" />
           Logout
         </Button>
       </div>
     </div>
   );
 }
