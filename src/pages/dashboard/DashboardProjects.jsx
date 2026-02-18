import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FolderKanban, Archive, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const MOCK_PROJECTS = [
  { id: 1, name: "Theme Customization", status: "active", progress: 60, updated: "2 days ago" },
  { id: 2, name: "SEO Audit & Fix", status: "active", progress: 100, updated: "1 week ago" },
  { id: 3, name: "Store Redesign", status: "pending", progress: 0, updated: "3 days ago" },
  { id: 4, name: "Checkout Optimization", status: "completed", progress: 100, updated: "2 weeks ago" },
];

export default function DashboardProjects() {
  const { user } = useOutletContext() || {};
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [filter, setFilter] = useState("all");

  const filtered = projects.filter((p) => filter === "all" || p.status === filter);

  const handleArchive = (id) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: "archived" } : p)));
  };
  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
            Projects
          </h1>
          <p className="text-neutral-600 text-sm mt-1">
            Manage ongoing projects, track progress, and view history.
          </p>
        </div>
        <Link
          to="/dashboard/marketplace?custom=1"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
        >
          New Project +
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "active", "pending", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-emerald-600 text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{p.name}</h3>
                  <p className="text-sm text-neutral-500">{p.updated}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Progress</span>
                  <span className="font-medium">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-2" />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  p.status === "completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : p.status === "active"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {p.status}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleArchive(p.id)}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 rounded-2xl bg-white border border-neutral-200 text-center text-neutral-500">
          No projects match this filter.
        </div>
      )}
    </div>
  );
}
