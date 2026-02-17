import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getOnboardingSessions } from "@/lib/managerApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function formatPlatform(p) {
  if (!p) return "—";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function formatFirstChoice(c) {
  if (!c) return "—";
  if (c === "design") return "Design / Redesign";
  if (c === "marketing") return "Marketing";
  return c;
}

export default function SignupUsers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadList = () => {
    setLoading(true);
    getOnboardingSessions()
      .then((arr) => setList(Array.isArray(arr) ? arr : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  const location = useLocation();

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (location.pathname === "/manager/signups") loadList();
  }, [location.pathname]);

  const filteredList = list.filter((row) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const platform = (row.platform || "").toLowerCase();
    const storeUrl = (row.store_url || "").toLowerCase();
    const firstChoice = (row.first_choice || "").toLowerCase();
    const createdAt = row.created_at ? format(new Date(row.created_at), "PPp").toLowerCase() : "";
    return platform.includes(q) || storeUrl.includes(q) || firstChoice.includes(q) || createdAt.includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-black">Signup users</h2>
        <p className="text-sm text-black/60 mt-1">
          Users who completed the Get started flow — platform, store, and first choice
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/50" />
          <Input
            placeholder="Search platform, store URL, choice…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className={cn("manager-glass-panel overflow-hidden", loading && "min-h-[200px]")}>
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-black/60">
            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No signup users yet.</p>
            <p className="text-sm mt-1">Users who complete the Get started flow will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Store URL</TableHead>
                <TableHead>First choice</TableHead>
                <TableHead>Connected</TableHead>
                <TableHead>Signed up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{formatPlatform(row.platform)}</TableCell>
                  <TableCell className="max-w-[240px] truncate" title={row.store_url || ""}>
                    {row.store_url || "—"}
                  </TableCell>
                  <TableCell>{formatFirstChoice(row.first_choice)}</TableCell>
                  <TableCell>{row.store_connected ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-black/70">
                    {row.created_at ? format(new Date(row.created_at), "PPp") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
