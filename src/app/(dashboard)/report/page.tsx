 "use client";
 
 import { useEffect, useState, useMemo } from "react";
 import { ColumnDef } from "@tanstack/react-table";
 import { DollarSign, Loader2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Label } from "@/components/ui/label";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { toast } from "sonner";
 import { DataTable } from "@/components/ui/data-table";
 import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
 
 interface SaleRecord {
   id: string;
   name: string;
   date: string;
   time: string;
   username: string;
   profile: string;
   comment: string;
   price: string;
 }
 
 const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
 const monthFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
 
 export default function ReportPage() {
   const [sales, setSales] = useState<SaleRecord[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchMode, setSearchMode] = useState<"daily" | "monthly">("monthly");
   const [day, setDay] = useState(new Date().getDate().toString().padStart(2, "0"));
   const [monthIdx, setMonthIdx] = useState(new Date().getMonth().toString());
   const [year, setYear] = useState(new Date().getFullYear().toString());
 
   async function loadSales(idhr?: string, idbl?: string) {
     setLoading(true);
     try {
       let url = "/api/report/selling";
       if (idhr) url += `?idhr=${idhr}`;
       else if (idbl) url += `?idbl=${idbl}`;
       const res = await fetch(url);
       const data = await res.json();
       if (data.success) setSales(data.data);
     } catch (error) {
       console.error("Failed to load sales:", error);
     } finally {
       setLoading(false);
     }
   }
 
   useEffect(() => {
     const idbl = `${monthNames[new Date().getMonth()]}${new Date().getFullYear()}`;
     loadSales(undefined, idbl);
   }, []);
 
   function handleFilter() {
     if (searchMode === "daily") {
       loadSales(`${monthNames[parseInt(monthIdx)]}/${day}/${year}`);
     } else {
       loadSales(undefined, `${monthNames[parseInt(monthIdx)]}${year}`);
     }
   }
 
   async function handleDelete() {
     if (!window.confirm("Delete filtered records?")) return;
     try {
       let url = "/api/report/selling";
       if (searchMode === "daily") url += `?idhr=${monthNames[parseInt(monthIdx)]}/${day}/${year}`;
       else url += `?idbl=${monthNames[parseInt(monthIdx)]}${year}`;
       const res = await fetch(url, { method: "DELETE" });
       const data = await res.json();
       if (data.success) { toast.success("Deleted"); loadSales(); }
       else toast.error(data.error || "Failed");
     } catch { toast.error("Failed to delete"); }
   }
 
   function exportToCSV() {
     const rows = [["Nr", "Date", "Time", "Username", "Profile", "Comment", "Price"], ...sales.map((s, i) => [i + 1, s.date, s.time, s.username, s.profile, s.comment, s.price])];
     const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
     const a = document.createElement("a");
     a.href = URL.createObjectURL(blob);
     a.download = `report-${monthNames[parseInt(monthIdx)]}${year}.csv`;
     a.click();
   }
 
   const totalPrice = useMemo(() => sales.reduce((sum, s) => sum + parseInt(s.price || "0"), 0), [sales]);
   const columns: ColumnDef<SaleRecord>[] = useMemo(() => [
     { id: "nr", header: () => <div className="text-center">Nr</div>, cell: ({ row }) => <div className="text-center">{row.index + 1}</div> },
     { accessorKey: "date", header: ({ column }) => <DataTableColumnHeader column={column} title="Date" /> },
     { accessorKey: "time", header: ({ column }) => <DataTableColumnHeader column={column} title="Time" /> },
     { accessorKey: "username", header: ({ column }) => <DataTableColumnHeader column={column} title="Username" /> },
     { accessorKey: "profile", header: ({ column }) => <DataTableColumnHeader column={column} title="Profile" /> },
     { accessorKey: "comment", header: ({ column }) => <DataTableColumnHeader column={column} title="Comment" /> },
     { accessorKey: "price", header: () => <div className="text-right">Price</div>, cell: ({ row }) => <div className="text-right">{row.original.price}</div> },
   ], []);
 
   if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
 
   const years = Array.from({ length: 10 }, (_, i) => (2020 + i).toString());
   const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));
 
   return (
     <div className="space-y-4">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold">Selling Report {monthFull[parseInt(monthIdx)]} {year}</h1>
         <div className="text-right"><div className="text-sm text-muted-foreground">Total</div><div className="text-2xl font-bold">Rp {totalPrice.toLocaleString()}</div></div>
       </div>
       <Card>
         <CardHeader><CardTitle>Search</CardTitle></CardHeader>
         <CardContent className="space-y-4">
           <div className="flex gap-4">
             <Button variant={searchMode === "daily" ? "default" : "outline"} onClick={() => setSearchMode("daily")}>Day</Button>
             <Button variant={searchMode === "monthly" ? "default" : "outline"} onClick={() => setSearchMode("monthly")}>Monthly</Button>
           </div>
           <div className="grid grid-cols-3 gap-4">
             {searchMode === "daily" && <div className="space-y-2"><Label>Day</Label><Select value={day} onValueChange={setDay}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{days.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>}
             <div className="space-y-2"><Label>Month</Label><Select value={monthIdx} onValueChange={setMonthIdx}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{monthFull.map((m, i) => <SelectItem key={i} value={i.toString()}>{m}</SelectItem>)}</SelectContent></Select></div>
             <div className="space-y-2"><Label>Year</Label><Select value={year} onValueChange={setYear}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></div>
           </div>
           <div className="flex flex-wrap gap-2">
             <Button onClick={handleFilter}>Filter</Button>
             <Button variant="outline" onClick={exportToCSV}>CSV</Button>
             <Button variant="outline" onClick={() => loadSales()}>All</Button>
             <Button variant="destructive" onClick={handleDelete}>Delete data</Button>
           </div>
         </CardContent>
       </Card>
       <Card>
         <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Selling Report</CardTitle><div className="text-sm text-muted-foreground">{sales.length} records</div></div></CardHeader>
         <CardContent><DataTable columns={columns} data={sales} searchPlaceholder="Search..." /></CardContent>
       </Card>
     </div>
   );
 }
