import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { getMe, logout, getAnalysedStores, getOrders, getPayments, getContacts, getLoginActivity, getSessions, terminateOtherSessions } from "@/lib/managerApi";
import {
  LayoutDashboard,
  BarChart3,
  Database,
  ShoppingCart,
  CreditCard,
  Mail,
  MessageCircle,
  FolderKanban,
  UserPlus,
  LogOut,
  Bell,
  Menu,
  X,
  Settings,
  Check,
  CheckCheck,
  Trash2,
  Activity,
  Smartphone,
  MonitorOff,
  FileText,
} from "lucide-react";
import notify1Url from "@/assets/notify1.wav";
import notify2Url from "@/assets/notify2.wav";
import notify3Url from "@/assets/notify3.wav";
import admIco from "@/assets/adm-ico.png";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import ManagerLogin from "./ManagerLogin";
import { format } from "date-fns";

const NOTIFICATIONS_READ_AT_KEY = "manager_notifications_read_at";
const NOTIFICATIONS_LIST_KEY = "manager_notifications_list";
const NOTIFICATION_SOUND_KEY = "manager_notification_sound";
const MAX_NOTIFICATIONS = 50;
const NOTIFICATION_LIST_MAX_HEIGHT_PX = 480; // half of previous for compact dropdown

const NOTIFICATION_SOUNDS = [
  { id: "notify1", label: "Sound 1", url: notify1Url },
  { id: "notify2", label: "Sound 2", url: notify2Url },
  { id: "notify3", label: "Sound 3", url: notify3Url },
];

function getNotificationSoundId() {
  try {
    const s = localStorage.getItem(NOTIFICATION_SOUND_KEY);
    if (s && ["notify1", "notify2", "notify3"].includes(s)) return s;
  } catch {}
  return "notify1";
}

function setNotificationSoundId(id) {
  try {
    localStorage.setItem(NOTIFICATION_SOUND_KEY, id);
  } catch {}
}

function playNotificationSound() {
  const id = getNotificationSoundId();
  const sound = NOTIFICATION_SOUNDS.find((s) => s.id === id);
  if (!sound?.url) return;
  try {
    const audio = new Audio(sound.url);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {}
}

const nav = [
  { to: "/manager", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/manager/signups", end: false, label: "Signups", icon: UserPlus },
  { to: "/manager/analysed-stores", end: false, label: "Analytics", icon: BarChart3 },
  { to: "/manager/services", end: false, label: "Data", icon: Database },
  { to: "/manager/orders", end: false, label: "Orders", icon: ShoppingCart },
  { to: "/manager/payments", end: false, label: "Payments", icon: CreditCard },
  { to: "/manager/customer-chat", end: false, label: "Customer Chat", icon: MessageCircle },
  { to: "/manager/messages", end: false, label: "Camages", icon: Mail },
  { to: "/manager/email-templates", end: false, label: "Email templates", icon: FileText },
  { to: "/manager/projects", end: false, label: "Projects", icon: FolderKanban },
];

function getLastReadAt() {
  try {
    const s = localStorage.getItem(NOTIFICATIONS_READ_AT_KEY);
    return s ? new Date(s).getTime() : 0;
  } catch {
    return 0;
  }
}

function setLastReadAt() {
  try {
    localStorage.setItem(NOTIFICATIONS_READ_AT_KEY, new Date().toISOString());
  } catch {}
}

function getStoredNotifications() {
  try {
    const s = localStorage.getItem(NOTIFICATIONS_LIST_KEY);
    if (!s) return [];
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredNotifications(list) {
  try {
    localStorage.setItem(NOTIFICATIONS_LIST_KEY, JSON.stringify(list));
  } catch {}
}

function buildNewItemsFromActivity(stores, orders, payments, contacts, lastReadAtMs) {
  // Include activity from last 7 days so we don't miss anything; new items are those after lastReadAtMs
  const cutoffMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const items = [];
  (stores || []).forEach((row) => {
    const at = (row.analysed_at || row.created_at) ? new Date(row.analysed_at || row.created_at).getTime() : 0;
    if (at > cutoffMs)
      items.push({
        id: `store-${row.id}`,
        title: "New store analysed",
        message: (row.store_url || "").replace(/^https?:\/\//i, "").slice(0, 60) || "Store audit completed",
        at: new Date(at).toISOString(),
        read: at <= lastReadAtMs,
        link: "/manager/analysed-stores",
      });
  });
  (orders || []).forEach((row) => {
    const at = row.created_at ? new Date(row.created_at).getTime() : 0;
    if (at > cutoffMs)
      items.push({
        id: `order-${row.id}`,
        title: "New order",
        message: row.email ? `Order from ${row.email}` : row.service_title || "New order",
        at: new Date(at).toISOString(),
        read: at <= lastReadAtMs,
        link: "/manager/orders",
      });
  });
  (payments || []).forEach((row) => {
    const at = row.created_at ? new Date(row.created_at).getTime() : 0;
    if (at > cutoffMs)
      items.push({
        id: `payment-${row.id}`,
        title: "New payment",
        message: row.amount_usd != null ? `$${row.amount_usd}` : row.email || "Payment received",
        at: new Date(at).toISOString(),
        read: at <= lastReadAtMs,
        link: "/manager/payments",
      });
  });
  (contacts || []).forEach((row) => {
    const status = (row.status || "").toLowerCase();
    if (["completed", "cancelled", "deleted"].includes(status)) return;
    const at = row.created_at ? new Date(row.created_at).getTime() : 0;
    if (at > cutoffMs)
      items.push({
        id: `contact-${row.id}`,
        title: "New message",
        message: row.email ? `Message from ${row.name || row.email}` : "Contact form submission",
        at: new Date(at).toISOString(),
        read: at <= lastReadAtMs,
        link: "/manager/messages",
      });
  });
  return items;
}

function mergeNotifications(storedList, newItemsFromApi) {
  const byId = new Map(storedList.map((n) => [n.id, n]));
  newItemsFromApi.forEach((n) => {
    if (!byId.has(n.id)) {
      // New notification: always show as unread (green dot) until user clicks or marks read
      byId.set(n.id, { ...n, read: false });
    }
  });
  const merged = Array.from(byId.values()).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return merged.slice(0, MAX_NOTIFICATIONS);
}

export default function ManagerLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => getStoredNotifications());
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationSound, setNotificationSound] = useState(() => getNotificationSoundId());
  const [soundSettingsOpen, setSoundSettingsOpen] = useState(false);
  const [loginActivityOpen, setLoginActivityOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [terminateSessionsOpen, setTerminateSessionsOpen] = useState(false);
  const [loginActivity, setLoginActivity] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terminateLoading, setTerminateLoading] = useState(false);
  const prevNotificationCountRef = useRef(0);
  const hasFetchedOnceRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayName = "Eze";

  const fetchNotifications = useCallback(() => {
    if (!user) return;
    const lastReadAtMs = getLastReadAt();
    const storedList = getStoredNotifications();
    Promise.allSettled([getAnalysedStores(), getOrders(), getPayments(), getContacts()])
      .then(([s, o, p, c]) => {
        const stores = s.status === "fulfilled" ? s.value : [];
        const orders = o.status === "fulfilled" ? o.value : [];
        const payments = p.status === "fulfilled" ? p.value : [];
        const contacts = c.status === "fulfilled" ? c.value : [];
        const newItems = buildNewItemsFromActivity(stores, orders, payments, Array.isArray(contacts) ? contacts : [], lastReadAtMs);
        const list = mergeNotifications(storedList, newItems);
        setNotifications(list);
        setStoredNotifications(list);
        const prevCount = prevNotificationCountRef.current;
        prevNotificationCountRef.current = list.length;
        if (hasFetchedOnceRef.current && list.length > 0 && list.length > prevCount) {
          playNotificationSound();
        }
        hasFetchedOnceRef.current = true;
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        if (!u) setLoading(false);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  useEffect(() => {
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    const interval = setInterval(fetchNotifications, 60 * 1000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNotificationOpenChange = (open) => {
    setNotificationOpen(open);
    if (open) {
      setLastReadAt();
      setNotifications((prev) => {
        const next = prev.map((n) => ({ ...n, read: true }));
        setStoredNotifications(next);
        prevNotificationCountRef.current = next.length;
        return next;
      });
    }
  };

  const handleMarkAllAsRead = () => {
    setLastReadAt();
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      setStoredNotifications(next);
      return next;
    });
    prevNotificationCountRef.current = notifications.length;
    setSoundSettingsOpen(false);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setStoredNotifications([]);
    setLastReadAt();
    prevNotificationCountRef.current = 0;
    setSoundSettingsOpen(false);
  };

  const handleLogout = () => {
    logout()
      .then(() => {
        setUser(null);
        navigate("/manager", { replace: true });
      })
      .catch(() => setUser(null));
  };

  if (loading) {
    return (
      <div className="manager-dashboard min-h-screen flex items-center justify-center bg-[var(--manager-bg)]">
        <Skeleton className="h-12 w-64 rounded-full manager-glass-panel" />
      </div>
    );
  }

  if (!user) return <ManagerLogin />;

  return (
    <div className="manager-dashboard min-h-screen bg-[var(--manager-bg)] flex">
      {/* Left sidebar – desktop only, fixed when scrolling */}
      <aside className="hidden md:flex md:flex-col md:w-56 lg:w-64 shrink-0 bg-white/60 border-r border-black/5 md:sticky md:top-0 md:self-start md:h-screen">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-black/5">
          <img src={logo} alt="Elursh" className="h-7 w-auto brightness-0" />
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-r-lg text-sm font-medium transition-colors",
                  isActive ? "bg-black/5 text-black" : "text-black/70 hover:bg-black/5 hover:text-black"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar – glassmorphism */}
        <header className="sticky top-0 z-50 manager-glass-panel border-0 rounded-none shrink-0">
          <div className="flex items-center justify-between h-14 px-4 py-2 md:px-6 md:py-3">
            {/* Mobile: menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full manager-pill w-10 h-10 text-black/80 hover:bg-white/50"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 min-w-0" />

            {/* Desktop: Notifications, User (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Popover open={notificationOpen} onOpenChange={handleNotificationOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full manager-pill w-9 h-9 text-black/80 hover:bg-white/50" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" aria-hidden />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 manager-glass-panel border-white/50" align="end" sideOffset={8}>
                <div className="p-2 border-b border-white/30 flex items-center justify-between">
                  <p className="text-sm font-semibold text-black">Notifications</p>
                  <Popover open={soundSettingsOpen} onOpenChange={setSoundSettingsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-black/70 hover:bg-white/30 hover:text-black"
                        aria-label="Notification sound settings"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2 manager-glass-panel border-white/50" align="end" sideOffset={4} onClick={(e) => e.stopPropagation()}>
                      <p className="text-xs font-medium text-black/70 px-2 py-1.5">Notification sound</p>
                      {NOTIFICATION_SOUNDS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setNotificationSound(s.id);
                            setNotificationSoundId(s.id);
                            setSoundSettingsOpen(false);
                          }}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium text-black hover:bg-white/30 transition-colors"
                        >
                          <span>{s.label}</span>
                          {notificationSound === s.id && <Check className="h-4 w-4 text-black shrink-0" />}
                        </button>
                      ))}
                      <div className="border-t border-white/30 mt-2 pt-2 space-y-1">
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium text-black hover:bg-white/30 transition-colors"
                        >
                          <CheckCheck className="h-4 w-4 shrink-0" />
                          Mark all as read
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllNotifications}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium text-black hover:bg-white/30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
                          Clear all notifications
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="overflow-y-auto manager-notification-list" style={{ maxHeight: NOTIFICATION_LIST_MAX_HEIGHT_PX }}>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-black/60">No new activity. New stores analysed, orders, payments, and contact messages will appear here.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        role={n.link ? "button" : undefined}
                        tabIndex={n.link ? 0 : undefined}
                        onClick={() => {
                          if (n.link) {
                            setNotifications((prev) => {
                              const next = prev.map((item) => (item.id === n.id ? { ...item, read: true } : item));
                              setStoredNotifications(next);
                              return next;
                            });
                            navigate(n.link);
                            setNotificationOpen(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (n.link && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            setNotifications((prev) => {
                              const next = prev.map((item) => (item.id === n.id ? { ...item, read: true } : item));
                              setStoredNotifications(next);
                              return next;
                            });
                            navigate(n.link);
                            setNotificationOpen(false);
                          }
                        }}
                        className={cn(
                          "relative p-3 border-b border-white/20 last:border-0 text-left",
                          n.link && "cursor-pointer hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-black/20"
                        )}
                      >
                        {!n.read && (
                          <span
                            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 ring-2 ring-white shrink-0"
                            aria-hidden
                          />
                        )}
                        <p className="text-sm font-medium text-black">{n.title}</p>
                        <p className="text-xs text-black/70 mt-0.5">{n.message}</p>
                        <p className="text-xs text-black/50 mt-1">{format(new Date(n.at), "PPp")}</p>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 border-l border-black/10 text-left hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-2 rounded-lg py-1">
                  <img src={admIco} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <span className="hidden md:block text-sm font-medium text-black truncate max-w-[140px]" title={displayName}>
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="manager-glass-panel border-white/50">
                <DropdownMenuItem
                  onClick={() => {
                    setLoginActivityOpen(true);
                    getLoginActivity().then(setLoginActivity);
                  }}
                  className="cursor-pointer gap-2 text-black"
                >
                  <Activity className="h-4 w-4" />
                  Login activity
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setDevicesOpen(true);
                    getSessions().then(setSessions);
                  }}
                  className="cursor-pointer gap-2 text-black"
                >
                  <Smartphone className="h-4 w-4" />
                  Devices
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTerminateSessionsOpen(true)}
                  className="cursor-pointer gap-2 text-black"
                >
                  <MonitorOff className="h-4 w-4" />
                  Terminate other sessions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-black">
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile: user avatar with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex md:hidden items-center p-1 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-2">
                <img src={admIco} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="manager-glass-panel border-white/50">
              <DropdownMenuItem
                onClick={() => {
                  setLoginActivityOpen(true);
                  getLoginActivity().then(setLoginActivity);
                }}
                className="cursor-pointer gap-2 text-black"
              >
                <Activity className="h-4 w-4" />
                Login activity
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDevicesOpen(true);
                  getSessions().then(setSessions);
                }}
                className="cursor-pointer gap-2 text-black"
              >
                <Smartphone className="h-4 w-4" />
                Devices
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTerminateSessionsOpen(true)}
                className="cursor-pointer gap-2 text-black"
              >
                <MonitorOff className="h-4 w-4" />
                Terminate other sessions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-black">
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile: overlay + slide-in nav from left */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 md:hidden",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] manager-glass-panel flex flex-col transition-transform duration-300 ease-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-white/30">
          <span className="text-sm font-semibold text-black">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9 text-black/80 hover:bg-white/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {nav.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "manager-pill flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                  isActive ? "manager-pill-active" : "text-black/80 hover:bg-white/50 hover:text-black"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/30 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <img src={admIco} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
            <span className="text-sm text-black truncate" title={displayName}>{displayName}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-black/80 hover:bg-white/50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Login activity dialog */}
      <Dialog open={loginActivityOpen} onOpenChange={setLoginActivityOpen}>
        <DialogContent className="manager-glass-panel border-white/50 max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-black">Login activity</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0 space-y-2 pr-2">
            {loginActivity.length === 0 ? (
              <p className="text-sm text-black/70">No login history available.</p>
            ) : (
              loginActivity.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg border border-white/30 bg-white/10 text-black text-sm"
                >
                  <p className="font-medium">{entry.device ?? entry.browser ?? "—"}</p>
                  {entry.ip && <p className="text-black/70 text-xs mt-0.5">{entry.ip}</p>}
                  <p className="text-black/60 text-xs mt-1">{format(new Date(entry.at), "PPp")}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Devices / sessions dialog */}
      <Dialog open={devicesOpen} onOpenChange={setDevicesOpen}>
        <DialogContent className="manager-glass-panel border-white/50 max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-black">Devices</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0 space-y-2 pr-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-black/70">No sessions found.</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "p-3 rounded-lg border text-sm",
                    session.current ? "border-green-500/50 bg-green-500/10" : "border-white/30 bg-white/10"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-black">{session.device ?? session.browser ?? "—"}</p>
                    {session.current && (
                      <span className="text-xs font-medium text-green-700 bg-green-500/20 px-2 py-0.5 rounded">This device</span>
                    )}
                  </div>
                  {session.browser && !session.current && <p className="text-black/70 text-xs mt-0.5">{session.browser}</p>}
                  <p className="text-black/60 text-xs mt-1">Last active: {format(new Date(session.last_active), "PPp")}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Terminate other sessions confirmation */}
      <AlertDialog open={terminateSessionsOpen} onOpenChange={setTerminateSessionsOpen}>
        <AlertDialogContent className="manager-glass-panel border-white/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Terminate other sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will log out all other devices. You will stay logged in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black/20 text-black" disabled={terminateLoading}>Cancel</AlertDialogCancel>
            <Button
              className="bg-black text-white hover:bg-black/90"
              disabled={terminateLoading}
              onClick={async (e) => {
                e.preventDefault();
                setTerminateLoading(true);
                try {
                  await terminateOtherSessions();
                  setTerminateSessionsOpen(false);
                  getSessions().then(setSessions);
                } finally {
                  setTerminateLoading(false);
                }
              }}
            >
              {terminateLoading ? "Terminating…" : "Terminate other sessions"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
