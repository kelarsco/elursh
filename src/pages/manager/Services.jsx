import { useState, useEffect } from "react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  getPriceModifier,
  setPriceModifier,
} from "@/lib/managerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Package, Palette, Search } from "lucide-react";

const CATEGORIES = ["salesGrowth", "storeImprovement"];
const TYPES = ["SEO", "CRO", "Email", "Ads", "Trust", "Speed", "Mobile", "Copy", "Collections", "Analytics", "Checkout", "Apps", "Audit", "Design", "Branding", "Redesign", "Social Media"];

const defaultServiceForm = () => ({
  title: "",
  category: "salesGrowth",
  type: "SEO",
  store_stages: [],
  description: "",
  pain_points: [],
  benefits: [],
  delivery_days_min: 5,
  delivery_days_max: 10,
  rating: 4.5,
  users: 0,
  packages: [],
  sort_order: 0,
});

const defaultThemeForm = () => ({
  name: "",
  price: 99,
  features: [],
  image: "",
  sort_order: 0,
});

export default function Services() {
  const [section, setSection] = useState("services");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [themesList, setThemesList] = useState([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultServiceForm());
  const [storeStagesRaw, setStoreStagesRaw] = useState("");
  const [painPointsRaw, setPainPointsRaw] = useState("");
  const [benefitsRaw, setBenefitsRaw] = useState("");
  const [packagesRaw, setPackagesRaw] = useState("[]");
  const [editingTheme, setEditingTheme] = useState(null);
  const [themeForm, setThemeForm] = useState(defaultThemeForm());
  const [featuresRaw, setFeaturesRaw] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteThemeId, setDeleteThemeId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceModifierPercent, setPriceModifierPercent] = useState(-30);
  const [priceModifierInput, setPriceModifierInput] = useState("-30");
  const [priceModifierSaving, setPriceModifierSaving] = useState(false);
  const { toast } = useToast();

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(
      (row) =>
        (row.title || "").toLowerCase().includes(q) ||
        (row.type || "").toLowerCase().includes(q) ||
        (row.category || "").toLowerCase().includes(q) ||
        (row.description || "").toLowerCase().includes(q)
    );
  }, [list, searchQuery]);

  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return themesList;
    const q = searchQuery.trim().toLowerCase();
    return themesList.filter(
      (row) =>
        (row.name || "").toLowerCase().includes(q) ||
        (Array.isArray(row.features) ? row.features : []).some((f) => String(f).toLowerCase().includes(q))
    );
  }, [themesList, searchQuery]);

  const loadServices = () => {
    setLoading(true);
    getServices()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  const loadThemes = () => {
    setThemesLoading(true);
    getThemes()
      .then(setThemesList)
      .catch(() => setThemesList([]))
      .finally(() => setThemesLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (section === "themes") loadThemes();
  }, [section]);

  useEffect(() => {
    if (section === "services") {
      getPriceModifier()
        .then((r) => {
          const p = Number(r?.priceModifierPercent ?? -30);
          setPriceModifierPercent(p);
          setPriceModifierInput(String(p));
        })
        .catch(() => {});
    }
  }, [section]);

  const handleApplyPriceModifier = () => {
    const n = Number(priceModifierInput);
    if (!Number.isFinite(n)) {
      toast({ title: "Invalid percent", variant: "destructive" });
      return;
    }
    setPriceModifierSaving(true);
    setPriceModifier(n)
      .then(() => {
        setPriceModifierPercent(n);
        toast({ title: "Price modifier applied. All store prices updated." });
      })
      .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setPriceModifierSaving(false));
  };

  useEffect(() => {
    setSearchQuery("");
    setSearchOpen(false);
  }, [section]);

  const parseArray = (raw) => raw.split("\n").map((s) => s.trim()).filter(Boolean);
  const parsePackages = (raw) => {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const openAddService = () => {
    setEditing("new");
    setForm({ ...defaultServiceForm(), sort_order: list.length });
    setStoreStagesRaw("");
    setPainPointsRaw("");
    setBenefitsRaw("");
    setPackagesRaw("[]");
  };

  const openEditService = (row) => {
    setEditing(row.id);
    setForm({
      title: row.title ?? "",
      category: row.category ?? "salesGrowth",
      type: row.type ?? "SEO",
      store_stages: Array.isArray(row.store_stages) ? row.store_stages : [],
      description: row.description ?? "",
      pain_points: Array.isArray(row.pain_points) ? row.pain_points : [],
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      delivery_days_min: row.delivery_days_min ?? 5,
      delivery_days_max: row.delivery_days_max ?? 10,
      rating: Number(row.rating) ?? 4.5,
      users: Number(row.users) ?? 0,
      packages: Array.isArray(row.packages) ? row.packages : [],
      sort_order: row.sort_order ?? 0,
    });
    setStoreStagesRaw(Array.isArray(row.store_stages) ? row.store_stages.join("\n") : "");
    setPainPointsRaw(Array.isArray(row.pain_points) ? row.pain_points.join("\n") : "");
    setBenefitsRaw(Array.isArray(row.benefits) ? row.benefits.join("\n") : "");
    setPackagesRaw(JSON.stringify(row.packages ?? [], null, 2));
  };

  const handleSaveService = () => {
    const store_stages = parseArray(storeStagesRaw);
    const pain_points = parseArray(painPointsRaw);
    const benefits = parseArray(benefitsRaw);
    const packages = parsePackages(packagesRaw);
    const body = { ...form, store_stages, pain_points, benefits, packages };
    setSaving(true);
    if (editing === "new") {
      createService(body)
        .then(() => {
          toast({ title: "Service created" });
          setEditing(null);
          loadServices();
        })
        .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }))
        .finally(() => setSaving(false));
    } else {
      updateService(editing, body)
        .then(() => {
          toast({ title: "Service updated" });
          setEditing(null);
          loadServices();
        })
        .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }))
        .finally(() => setSaving(false));
    }
  };

  const handleDeleteService = (id) => {
    deleteService(id)
      .then(() => {
        toast({ title: "Service deleted" });
        setDeleteId(null);
        loadServices();
      })
      .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }));
  };

  const openAddTheme = () => {
    setEditingTheme("new");
    setThemeForm({ ...defaultThemeForm(), sort_order: themesList.length });
    setFeaturesRaw("");
  };

  const openEditTheme = (row) => {
    setEditingTheme(row.id);
    setThemeForm({
      name: row.name ?? "",
      price: Number(row.price) ?? 99,
      features: Array.isArray(row.features) ? row.features : [],
      image: row.image ?? "",
      sort_order: row.sort_order ?? 0,
    });
    setFeaturesRaw(Array.isArray(row.features) ? row.features.join("\n") : "");
  };

  const handleSaveTheme = () => {
    const features = parseArray(featuresRaw);
    const body = { ...themeForm, features };
    setSaving(true);
    if (editingTheme === "new") {
      createTheme(body)
        .then(() => {
          toast({ title: "Theme created" });
          setEditingTheme(null);
          loadThemes();
        })
        .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }))
        .finally(() => setSaving(false));
    } else {
      updateTheme(editingTheme, body)
        .then(() => {
          toast({ title: "Theme updated" });
          setEditingTheme(null);
          loadThemes();
        })
        .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }))
        .finally(() => setSaving(false));
    }
  };

  const handleDeleteTheme = (id) => {
    deleteTheme(id)
      .then(() => {
        toast({ title: "Theme deleted" });
        setDeleteThemeId(null);
        loadThemes();
      })
      .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-black">
        Services & Themes
      </h1>

      {/* Section switcher */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/50 border border-white/50">
        <button
          type="button"
          onClick={() => setSection("services")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            section === "services"
              ? "bg-black text-[var(--manager-lime)]"
              : "text-black/70 hover:bg-white/50 hover:text-black"
          )}
        >
          <Package className="h-4 w-4" />
          Services
        </button>
        <button
          type="button"
          onClick={() => setSection("themes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            section === "themes"
              ? "bg-black text-[var(--manager-lime)]"
              : "text-black/70 hover:bg-white/50 hover:text-black"
          )}
        >
          <Palette className="h-4 w-4" />
          Themes
        </button>
      </div>

      {/* Services section */}
      {section === "services" && (
        <div className="manager-glass-panel overflow-hidden">
          {/* Global price modifier */}
          <div className="p-6 border-b border-white/30 bg-white/20">
            <h3 className="text-sm font-semibold text-black mb-2">Global price modifier</h3>
            <p className="text-xs text-black/60 mb-3">Apply a percent change to all Basic, Standard, Premium package prices across the store. Negative = discount (e.g. -30 = 30% off).</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                type="number"
                value={priceModifierInput}
                onChange={(e) => setPriceModifierInput(e.target.value)}
                className="w-24"
                placeholder="-30"
              />
              <span className="text-sm text-black/70">%</span>
              <Button onClick={handleApplyPriceModifier} disabled={priceModifierSaving} size="sm">
                {priceModifierSaving ? "Applying…" : "Apply to all prices"}
              </Button>
              {Number.isFinite(priceModifierPercent) && (
                <span className="text-xs text-black/60">Current: {priceModifierPercent}%</span>
              )}
            </div>
          </div>
          <div className="p-6 border-b border-white/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-black">Products & services (Improve Store)</h2>
              <p className="text-sm text-black/60 mt-1">
                {list.length === filteredServices.length
                  ? `${list.length} service${list.length === 1 ? "" : "s"}`
                  : `${filteredServices.length} of ${list.length} services`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className={cn("flex items-center overflow-hidden transition-all duration-200", searchOpen ? "w-48 sm:w-56" : "w-9")}>
                <button
                  type="button"
                  onClick={() => setSearchOpen((o) => !o)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-muted"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
                <Input
                  placeholder="Search services…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("h-9 rounded-l-none border-l-0 -ml-px w-full min-w-0", !searchOpen && "sr-only")}
                  onBlur={() => { if (!searchQuery.trim()) setSearchOpen(false); }}
                />
              </div>
              <Button onClick={openAddService} className="manager-pill bg-black text-[var(--manager-lime)] hover:bg-black/90 shrink-0">
                Add service
              </Button>
            </div>
            <Dialog open={editing != null} onOpenChange={(open) => !open && setEditing(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editing === "new" ? "Add service" : "Edit service"}</DialogTitle>
                  <DialogDescription>Edit every field below. Synced with Improve Store page.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1" placeholder="Service title" />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm mt-1" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm mt-1" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Sort order</Label>
                      <Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="mt-1" />
                  </div>
                  <div>
                    <Label>Store stages (one per line)</Label>
                    <Textarea value={storeStagesRaw} onChange={(e) => setStoreStagesRaw(e.target.value)} placeholder="New Store&#10;Growing&#10;Scaling" rows={2} className="mt-1" />
                  </div>
                  <div>
                    <Label>Pain points (one per line)</Label>
                    <Textarea value={painPointsRaw} onChange={(e) => setPainPointsRaw(e.target.value)} rows={2} className="mt-1" />
                  </div>
                  <div>
                    <Label>Benefits (one per line)</Label>
                    <Textarea value={benefitsRaw} onChange={(e) => setBenefitsRaw(e.target.value)} rows={2} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Delivery days min</Label>
                      <Input type="number" value={form.delivery_days_min} onChange={(e) => setForm((f) => ({ ...f, delivery_days_min: Number(e.target.value) || 0 }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>Delivery days max</Label>
                      <Input type="number" value={form.delivery_days_max} onChange={(e) => setForm((f) => ({ ...f, delivery_days_max: Number(e.target.value) || 0 }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <Input type="number" step="0.1" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) || 0 }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>Users count</Label>
                      <Input type="number" value={form.users} onChange={(e) => setForm((f) => ({ ...f, users: Number(e.target.value) || 0 }))} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Packages (JSON array)</Label>
                    <Textarea value={packagesRaw} onChange={(e) => setPackagesRaw(e.target.value)} rows={10} className="font-mono text-sm mt-1" placeholder='[{"name":"Basic","price":299,...},...]' />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button onClick={handleSaveService} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="p-6">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : list.length === 0 ? (
              <p className="text-muted-foreground">No services. Add one to show on Improve Store.</p>
            ) : filteredServices.length === 0 ? (
              <p className="text-muted-foreground">No services match your search.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.rating}</TableCell>
                      <TableCell>{row.sort_order}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openEditService(row)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(row.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* Themes section */}
      {section === "themes" && (
        <div className="manager-glass-panel overflow-hidden">
          <div className="p-6 border-b border-white/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-black">Themes (Theme page)</h2>
              <p className="text-sm text-black/60 mt-1">
                {themesList.length === filteredThemes.length
                  ? `${themesList.length} theme${themesList.length === 1 ? "" : "s"}`
                  : `${filteredThemes.length} of ${themesList.length} themes`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className={cn("flex items-center overflow-hidden transition-all duration-200", searchOpen ? "w-48 sm:w-56" : "w-9")}>
                <button
                  type="button"
                  onClick={() => setSearchOpen((o) => !o)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-muted"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
                <Input
                  placeholder="Search themes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("h-9 rounded-l-none border-l-0 -ml-px w-full min-w-0", !searchOpen && "sr-only")}
                  onBlur={() => { if (!searchQuery.trim()) setSearchOpen(false); }}
                />
              </div>
              <Button onClick={openAddTheme} className="manager-pill bg-black text-[var(--manager-lime)] hover:bg-black/90 shrink-0">
                Add theme
              </Button>
            </div>
            <Dialog open={editingTheme != null} onOpenChange={(open) => !open && setEditingTheme(null)}>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTheme === "new" ? "Add theme" : "Edit theme"}</DialogTitle>
                  <DialogDescription>Edit every field. Name, price, features, image (URL or upload), sort order.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={themeForm.name} onChange={(e) => setThemeForm((f) => ({ ...f, name: e.target.value }))} className="mt-1" placeholder="Theme name" />
                    </div>
                    <div>
                      <Label>Price (USD)</Label>
                      <Input type="number" value={themeForm.price} onChange={(e) => setThemeForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Image (URL or upload)</Label>
                    <Input value={themeForm.image} onChange={(e) => setThemeForm((f) => ({ ...f, image: e.target.value }))} className="mt-1" placeholder="https://... or upload below" />
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-muted/50">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setThemeForm((f) => ({ ...f, image: reader.result ?? "" }));
                            reader.readAsDataURL(file);
                            e.target.value = "";
                          }}
                        />
                        Upload from device
                      </label>
                      {themeForm.image && (
                        <div className="flex items-center gap-2">
                          <img src={themeForm.image} alt="Preview" className="h-16 w-16 object-cover rounded border border-border" />
                          <Button type="button" variant="ghost" size="sm" onClick={() => setThemeForm((f) => ({ ...f, image: "" }))}>Clear</Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Sort order</Label>
                    <Input type="number" value={themeForm.sort_order} onChange={(e) => setThemeForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Features (one per line)</Label>
                    <Textarea value={featuresRaw} onChange={(e) => setFeaturesRaw(e.target.value)} placeholder="Premium Design&#10;Mobile Optimized&#10;SEO Ready" rows={4} className="mt-1" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingTheme(null)}>Cancel</Button>
                  <Button onClick={handleSaveTheme} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="p-6">
            {themesLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : themesList.length === 0 ? (
              <p className="text-muted-foreground">No themes. Add one to show on Theme page. If the DB is empty, the site uses static themes.</p>
            ) : filteredThemes.length === 0 ? (
              <p className="text-muted-foreground">No themes match your search.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThemes.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>${Number(row.price)}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={(row.features || []).join(", ")}>{(row.features || []).length} items</TableCell>
                      <TableCell>{row.sort_order}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openEditTheme(row)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteThemeId(row.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId != null && handleDeleteService(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteThemeId != null} onOpenChange={(open) => !open && setDeleteThemeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete theme?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteThemeId != null && handleDeleteTheme(deleteThemeId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
