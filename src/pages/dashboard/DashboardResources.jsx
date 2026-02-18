import { BookOpen, FileText, CheckSquare, TrendingUp, Target } from "lucide-react";

const RESOURCES = [
  { title: "How to Run an Ecommerce Business", icon: BookOpen, category: "Basics" },
  { title: "Making Sales on Time", icon: TrendingUp, category: "Sales" },
  { title: "Position Yourself as a Brand", icon: Target, category: "Branding" },
  { title: "Store Launch Checklist", icon: CheckSquare, category: "Checklists" },
  { title: "Conversion Optimization Guide", icon: FileText, category: "Growth" },
  { title: "Customer Retention Playbook", icon: BookOpen, category: "Retention" },
];

export default function DashboardResources() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
          Resources
        </h1>
        <p className="text-neutral-600 text-sm mt-1">
          Guides, checklists, and documents to grow your ecommerce business.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESOURCES.map((r, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
                <r.icon className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                  {r.category}
                </span>
                <h3 className="font-semibold text-neutral-900 mt-1 group-hover:text-emerald-700 transition-colors">
                  {r.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
