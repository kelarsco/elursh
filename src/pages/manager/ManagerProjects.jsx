import { useState } from "react";
import { format } from "date-fns";
import { FolderKanban, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const MOCK_PROJECTS = [
  { id: 1, customer: "Eze Ezekiel", title: "Theme Customization", status: "active", progress: 60, updatedAt: "2026-01-30" },
  { id: 2, customer: "Jane Doe", title: "SEO Audit & Fix", status: "completed", progress: 100, updatedAt: "2026-01-28" },
  { id: 3, customer: "John Smith", title: "Custom Project: Brand Redesign", status: "pending", progress: 0, updatedAt: "2026-01-29" },
];

export default function ManagerProjects() {
  const [projects, setProjects] = useState(MOCK_PROJECTS);

  const updateProgress = (id, progress) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, progress, status: progress >= 100 ? "completed" : "active" } : p))
    );
  };

  const updateStatus = (id, status) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Customer Projects</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update project progress, complete projects, and view custom project requests.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                      <FolderKanban className="w-4 h-4 text-neutral-600" />
                    </div>
                    {p.customer}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>
                  <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 w-40">
                    <Progress value={p.progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium w-10">{p.progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-neutral-500 text-sm">{format(new Date(p.updatedAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <Select
                    value={String(p.progress)}
                    onValueChange={(v) => updateProgress(p.id, Number(v))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 25, 50, 75, 100].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
