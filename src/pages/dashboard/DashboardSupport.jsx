import { useOutletContext, Link } from "react-router-dom";
import { HelpCircle, MessageCircle, Mail } from "lucide-react";

export default function DashboardSupport() {
  const { user } = useOutletContext() || {};
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
          Support
        </h1>
        <p className="text-neutral-600 text-sm mt-1">Get help when you need it.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/dashboard/chat"
          className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-emerald-300 transition-colors flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Chat with us</h3>
            <p className="text-sm text-neutral-600 mt-1">Message our team for quick help.</p>
          </div>
        </Link>
        <a
          href="/contact"
          className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-emerald-300 transition-colors flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Contact</h3>
            <p className="text-sm text-neutral-600 mt-1">Reach us via our contact form.</p>
          </div>
        </a>
      </div>
    </div>
  );
}
