import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function DashboardOrderHistory() {
  const { user } = useOutletContext() || {};
  const [orders] = useState([]);
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
          Order History
        </h1>
        <p className="text-neutral-600 text-sm mt-1">View your past orders and purchases.</p>
      </div>
      {orders.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-neutral-200 text-center text-neutral-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">Order list here</div>
      )}
    </div>
  );
}
