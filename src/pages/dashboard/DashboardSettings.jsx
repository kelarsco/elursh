import { useOutletContext } from "react-router-dom";
import { Link } from "react-router-dom";
import { User, Store } from "lucide-react";

export default function DashboardSettings() {
  const { user } = useOutletContext() || {};
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
          Settings
        </h1>
        <p className="text-neutral-600 text-sm mt-1">Manage your account and preferences.</p>
      </div>
      <div className="space-y-4">
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Profile</h3>
              <p className="text-sm text-neutral-600">Update your name and email.</p>
            </div>
          </div>
        </div>
        <Link
          to="/get-started"
          className="block p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Store className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Connected Store</h3>
              <p className="text-sm text-neutral-600">Change or reconnect your store.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
