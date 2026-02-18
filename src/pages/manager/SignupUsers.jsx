import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getOnboardingSessions, deleteOnboardingSessions } from "@/lib/managerApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserPlus, Search, MoreVertical, Trash2 } from "lucide-react";
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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
    const email = (row.email || "").toLowerCase();
    const firstChoice = (row.first_choice || "").toLowerCase();
    const createdAt = row.created_at ? format(new Date(row.created_at), "PPp").toLowerCase() : "";
    return platform.includes(q) || storeUrl.includes(q) || email.includes(q) || firstChoice.includes(q) || createdAt.includes(q);
  });

  const toggleSelect = (id) => {
    // Normalize ID to number for consistency
    const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(normalizedId)) return;
    
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(normalizedId)) {
        next.delete(normalizedId);
      } else {
        next.add(normalizedId);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      const idsToDelete = Array.from(selectedIds).map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id));
      if (idsToDelete.length === 0) {
        alert("No valid IDs to delete");
        return;
      }
      const result = await deleteOnboardingSessions(idsToDelete);
      console.log("Delete result:", result);
      
      // Immediately remove deleted items from the list
      setList(prev => prev.filter(item => !idsToDelete.includes(item.id)));
      
      setSelectedIds(new Set());
      setSelectionMode(false);
      setDeleteConfirmOpen(false);
      
      // Also reload to ensure sync with server
      loadList();
    } catch (e) {
      console.error("Delete error:", e);
      alert("Failed to delete: " + (e.message || "Unknown error"));
    }
  };

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
            placeholder="Search email, platform, store URL…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-black/70 hover:bg-black/10">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-black/10">
            <DropdownMenuItem onClick={() => setSelectionMode(true)}>
              Select multiple
            </DropdownMenuItem>
            {selectionMode && (
              <DropdownMenuItem onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}>
                Cancel selection
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={cn("manager-glass-panel overflow-hidden", loading && "min-h-[200px]")}>
        {selectionMode && selectedIds.size > 0 && (
          <div className="px-6 py-3 border-b border-white/20 flex items-center justify-between gap-4 bg-black/5">
            <span className="text-sm text-black/70">{selectedIds.size} selected</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete selected
            </Button>
          </div>
        )}
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
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectionMode && <TableHead className="w-[50px]"></TableHead>}
                  <TableHead>Email</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Store URL</TableHead>
                  <TableHead>First choice</TableHead>
                  <TableHead>Connected</TableHead>
                  <TableHead>Signed up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.map((row) => {
                  const rowId = typeof row.id === 'string' ? parseInt(row.id, 10) : row.id;
                  return (
                  <TableRow 
                    key={row.id}
                    className={cn(
                      selectionMode && selectedIds.has(rowId) && "bg-black/5"
                    )}
                  >
                    {selectionMode && (
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(rowId)}
                          onCheckedChange={() => toggleSelect(rowId)}
                          className="border-black/30 data-[state=checked]:bg-black data-[state=checked]:border-black"
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      {row.email || "—"}
                    </TableCell>
                    <TableCell>{formatPlatform(row.platform)}</TableCell>
                    <TableCell className="max-w-[240px] truncate" title={row.store_url || ""}>
                      {row.store_url || "—"}
                    </TableCell>
                    <TableCell>{formatFirstChoice(row.first_choice)}</TableCell>
                    <TableCell>{row.store_connected ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-black/70">
                      {row.created_at ? format(new Date(row.created_at), "PPp") : "—"}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected signup sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.size} signup session{selectedIds.size !== 1 ? "s" : ""}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
