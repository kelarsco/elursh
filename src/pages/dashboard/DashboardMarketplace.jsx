import { useState, useEffect } from "react";
import { Link, useSearchParams, useOutletContext } from "react-router-dom";
import { Search, Star, Sparkles, Package } from "lucide-react";
import { apiBase } from "@/lib/apiBase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function ServiceCard({ item, type, onOrder }) {
  const packages = item.packages || [];
  const minPrice = type === "Theme" 
    ? (item.price ?? 0) 
    : (packages.length ? Math.min(...packages.map((p) => p.price || 0)) : 0);

  return (
    <div className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all">
      <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden">
        {item.image && (
          <img src={item.image} alt="" className="w-full h-full object-cover" />
        )}
        <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/90 text-xs font-medium text-neutral-700">
          {item.type || item.name || type}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-sm text-amber-600 mb-2">
          <Star className="w-4 h-4 fill-current" />
          <span>{Number(item.rating) || 4.5}</span>
          <span className="text-neutral-400">·</span>
          <span className="text-neutral-500">{item.users || 0} orders</span>
        </div>
        <h3 className="font-semibold text-neutral-900 line-clamp-2">{item.title || item.name}</h3>
        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{item.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-emerald-600">From ${minPrice}</span>
          <Button size="sm" onClick={() => onOrder(item)} className="bg-emerald-600 hover:bg-emerald-700">
            Order
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardMarketplace() {
  const { user } = useOutletContext() || {};
  const [searchParams] = useSearchParams();
  const showCustom = searchParams.get("custom") === "1";

  const [services, setServices] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("services");
  const [search, setSearch] = useState("");
  const [customModalOpen, setCustomModalOpen] = useState(showCustom);
  const [customBrief, setCustomBrief] = useState("");

  useEffect(() => {
    const base = apiBase || "";
    Promise.all([
      fetch(`${base}/api/services`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${base}/api/themes`).then((r) => (r.ok ? r.json() : [])),
    ]).then(([s, t]) => {
      setServices(Array.isArray(s) ? s : []);
      setThemes(Array.isArray(t) ? t : []);
    }).finally(() => setLoading(false));
  }, []);

  const allItems = tab === "services" ? services : themes;
  const filtered = allItems.filter(
    (x) =>
      !search ||
      (x.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (x.type || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleOrder = (item) => {
    if (tab === "services") {
      window.location.href = `/improve-store?service=${item.id}`;
    } else {
      window.location.href = `/theme?theme=${item.id}`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
            Services & Themes
          </h1>
          <p className="text-neutral-600 text-sm mt-1">
            Browse services and themes. Order what you need or create a custom project.
          </p>
        </div>
        <Button
          onClick={() => setCustomModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Create custom project (AI)
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("services")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "services" ? "bg-emerald-600 text-white" : "bg-white border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setTab("themes")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "themes" ? "bg-emerald-600 text-white" : "bg-white border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          Themes
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tab}...`}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <ServiceCard
              key={item.id}
              item={item}
              type={tab === "services" ? "Service" : "Theme"}
              onOrder={handleOrder}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center text-neutral-500 rounded-2xl border border-dashed border-neutral-300">
          No {tab} found. Try a different search.
        </div>
      )}

      <Dialog open={customModalOpen} onOpenChange={setCustomModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Create custom project
            </DialogTitle>
            <DialogDescription>
              Describe your project and we&apos;ll help you scope it. AI-assisted content generation coming soon.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={customBrief}
            onChange={(e) => setCustomBrief(e.target.value)}
            placeholder="Describe your custom project: what you need, goals, timeline..."
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                // TODO: submit to API, create custom project
                setCustomModalOpen(false);
                setCustomBrief("");
              }}
              disabled={!customBrief.trim()}
            >
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
