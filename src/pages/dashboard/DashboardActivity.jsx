import { useOutletContext } from "react-router-dom";
import { Activity } from "lucide-react";

export default function DashboardActivity() {
  const { user } = useOutletContext() || {};
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
          Activity
        </h1>
        <p className="text-neutral-600 text-sm mt-1">Recent activity on your account and store.</p>
      </div>
      <div className="p-12 rounded-2xl bg-white border border-neutral-200 text-center text-neutral-500">
        <Activity className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
        <p>No recent activity yet.</p>
      </div>
    </div>
  );
}
