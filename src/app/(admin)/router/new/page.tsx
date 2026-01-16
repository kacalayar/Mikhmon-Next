 "use client";
 
 import { useState } from "react";
 import { useRouter } from "next/navigation";
 import { Save, ArrowLeft, Loader2, Eye, EyeOff, Wifi } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { toast } from "sonner";
 
 export default function AddRouterPage() {
   const router = useRouter();
   const [saving, setSaving] = useState(false);
   const [testing, setTesting] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
 
   const [formData, setFormData] = useState({
     name: "",
     host: "",
     port: 8728,
     username: "admin",
     password: "",
     hotspotName: "",
     dnsName: "",
     currency: "Rp",
     autoReload: 10,
   });
 
   async function handleSave(e: React.FormEvent) {
     e.preventDefault();
     if (!formData.name || !formData.host) {
       toast.error("Session Name dan IP MikroTik wajib diisi");
       return;
     }
 
     // Parse host:port if provided in host field
     let host = formData.host;
     let port = formData.port;
     
     if (formData.host.includes(":")) {
       const parts = formData.host.split(":");
       host = parts[0];
       port = parseInt(parts[1]) || 8728;
     }
 
     setSaving(true);
     try {
       const res = await fetch("/api/routers", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ ...formData, host, port }),
       });
       const result = await res.json();
 
       if (result.success) {
         toast.success("Router berhasil ditambahkan");
         router.push("/sessions");
       } else {
         toast.error(result.error || "Gagal menambahkan router");
       }
     } catch {
       toast.error("Gagal menambahkan router");
     } finally {
       setSaving(false);
     }
   }
 
   async function handleTest() {
     if (!formData.host) {
       toast.error("IP MikroTik wajib diisi");
       return;
     }
 
     setTesting(true);
     try {
       const host = formData.host.split(":")[0];
       const port =
         parseInt(formData.host.split(":")[1]) || formData.port || 8728;
 
       const res = await fetch("/api/test-connection", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ host, port }),
       });
       const result = await res.json();
 
       if (result.success) {
         toast.success(`Ping OK - ${host}:${port}`);
       } else {
         toast.error(`Ping Failed - ${host}:${port} - ${result.error}`);
       }
     } catch {
       toast.error("Ping test failed");
     } finally {
       setTesting(false);
     }
   }
 
   return (
     <div className="space-y-6">
       <div className="flex items-center gap-4">
         <Button
           variant="outline"
           size="sm"
           onClick={() => router.push("/sessions")}
         >
           <ArrowLeft className="mr-2 h-4 w-4" />
           Back
         </Button>
         <h1 className="text-xl font-semibold">Add Router</h1>
       </div>
 
       <form onSubmit={handleSave}>
         <div className="grid gap-6 lg:grid-cols-2">
           <Card>
             <CardHeader>
               <CardTitle>Session</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Session Name *</Label>
                 <Input
                   id="name"
                   value={formData.name}
                   onChange={(e) =>
                     setFormData({ ...formData, name: e.target.value })
                   }
                   required
                 />
               </div>
             </CardContent>
           </Card>
 
           <Card>
             <CardHeader>
               <CardTitle>MikroTik</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="host">IP MikroTik (atau hostname:port) *</Label>
                 <Input
                   id="host"
                   value={formData.host}
                   onChange={(e) =>
                     setFormData({ ...formData, host: e.target.value })
                   }
                   placeholder="192.168.88.1 atau id-10.hostddns.us:56933"
                   required
                 />
                 <p className="text-xs text-muted-foreground">
                   Bisa input IP saja (192.168.88.1) atau hostname:port (id-10.hostddns.us:56933)
                 </p>
               </div>
               <div className="space-y-2">
                 <Label htmlFor="username">Username *</Label>
                 <Input
                   id="username"
                   value={formData.username}
                   onChange={(e) =>
                     setFormData({ ...formData, username: e.target.value })
                   }
                   required
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="password">Password *</Label>
                 <div className="flex gap-2">
                   <Input
                     id="password"
                     type={showPassword ? "text" : "password"}
                     value={formData.password}
                     onChange={(e) =>
                       setFormData({ ...formData, password: e.target.value })
                     }
                     required
                   />
                   <Button
                     type="button"
                     variant="outline"
                     size="icon"
                     onClick={() => setShowPassword(!showPassword)}
                   >
                     {showPassword ? (
                       <EyeOff className="h-4 w-4" />
                     ) : (
                       <Eye className="h-4 w-4" />
                     )}
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Card className="lg:col-span-2">
             <CardHeader>
               <CardTitle>Mikhmon Data</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                 <div className="space-y-2">
                   <Label htmlFor="hotspotName">Hotspot Name</Label>
                   <Input
                     id="hotspotName"
                     value={formData.hotspotName}
                     onChange={(e) =>
                       setFormData({ ...formData, hotspotName: e.target.value })
                     }
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="dnsName">DNS Name</Label>
                   <Input
                     id="dnsName"
                     value={formData.dnsName}
                     onChange={(e) =>
                       setFormData({ ...formData, dnsName: e.target.value })
                     }
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="currency">Currency</Label>
                   <Input
                     id="currency"
                     value={formData.currency}
                     onChange={(e) =>
                       setFormData({ ...formData, currency: e.target.value })
                     }
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="autoReload">Auto Reload (sec)</Label>
                   <Input
                     id="autoReload"
                     type="number"
                     min={10}
                     value={formData.autoReload}
                     onChange={(e) =>
                       setFormData({
                         ...formData,
                         autoReload: parseInt(e.target.value) || 10,
                       })
                     }
                   />
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         <div className="mt-6 flex gap-2">
           <Button
             type="button"
             variant="outline"
             disabled={testing}
             onClick={handleTest}
           >
             {testing ? (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
               <Wifi className="mr-2 h-4 w-4" />
             )}
             Ping
           </Button>
           <Button type="submit" disabled={saving}>
             {saving ? (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
               <Save className="mr-2 h-4 w-4" />
             )}
             Save
           </Button>
         </div>
       </form>
     </div>
   );
 }
