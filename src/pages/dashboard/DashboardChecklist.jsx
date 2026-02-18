import { useOutletContext } from "react-router-dom";
import { CheckSquare } from "lucide-react";

const CHECKLIST_ITEMS = [
  { title: "Store Launch Checklist", desc: "Everything to verify before going live." },
  { title: "SEO Checklist", desc: "Optimize your store for search." },
  { title: "Conversion Checklist", desc: "Improve checkout and conversion rates." },
];

export default function DashboardChecklist() {
  const { user } = useOutletContext() || {};
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
          Checklist
        </h1>
        <p className="text-neutral-600 text-sm mt-1">Guides and checklists to run your store.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {CHECKLIST_ITEMS.map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-emerald-300 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckSquare className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                <p className="text-sm text-neutral-600 mt-1">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
