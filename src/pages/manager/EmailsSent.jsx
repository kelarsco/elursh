import { useState, useEffect } from "react";
import { getEmailsSent, deleteEmailsSent } from "@/lib/managerApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MoreHorizontal, Trash2 } from "lucide-react";

export default function EmailsSent() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const getRowKey = (row) => `email-${row.id}`;
  const toggleSelect = (row) => {
    const key = getRowKey(row);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const selectAll = () => {
    if (selectedIds.size === list.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(list.map((r) => getRowKey(r))));
  };
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    const toDelete = list.filter((r) => selectedIds.has(getRowKey(r)));
    try {
      await deleteEmailsSent(toDelete.map((r) => r.id));
      toast({ title: "Deleted", description: `${toDelete.length} email(s) removed` });
      setSelectedIds(new Set());
      setSelectMode(false);
      setList((prev) => prev.filter((r) => !toDelete.some((d) => d.id === r.id)));
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    getEmailsSent()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-black">
        Emails Sent
      </h1>
      <div className="manager-glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-black">Log of emails sent from the manager</h2>
          <div className="flex items-center gap-2">
            {selectMode && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0 || deleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setSelectMode(false);
                    setSelectedIds(new Set());
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
            {!selectMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 manager-pill rounded-lg">
                    <MoreHorizontal className="h-5 w-5 text-black/70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="manager-glass-panel border-white/50">
                  <DropdownMenuItem onClick={() => setSelectMode(true)}>
                    Select multiple
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : list.length === 0 ? (
            <p className="text-black/60">No emails sent yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {selectMode && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === list.length && list.length > 0}
                        onCheckedChange={selectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead>To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((row) => (
                  <TableRow key={row.id}>
                    {selectMode && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(getRowKey(row))}
                          onCheckedChange={() => toggleSelect(row)}
                          aria-label={`Select ${row.to_email}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm">{row.to_email}</TableCell>
                    <TableCell className="max-w-[300px] truncate" title={row.subject || ""}>
                      {row.subject || "—"}
                    </TableCell>
                    <TableCell>{row.sent_at ? format(new Date(row.sent_at), "PPp") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
