import { useOutletContext } from "react-router-dom";
import { Zap } from "lucide-react";

export default function DashboardSalesHack() {
  const { user } = useOutletContext() || {};
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
          Sales Hack
        </h1>
        <p className="text-neutral-600 text-sm mt-1">Tips and strategies to boost your sales.</p>
      </div>
      <div className="space-y-4">
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-emerald-300 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Sales Hacks Coming Soon</h3>
              <p className="text-sm text-neutral-600 mt-1">We&apos;re curating the best sales tips for ecommerce. Check back soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
