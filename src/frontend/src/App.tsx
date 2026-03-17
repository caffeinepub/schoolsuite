import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { UserRole } from "./backend";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { cn } from "./lib/utils";
import Attendance from "./pages/Attendance";
import Dashboard from "./pages/Dashboard";
import Fees from "./pages/Fees";
import Homework from "./pages/Homework";
import LoginPage from "./pages/LoginPage";
import Notices from "./pages/Notices";
import Results from "./pages/Results";
import Students from "./pages/Students";
import Timetable from "./pages/Timetable";
import UserManagement from "./pages/UserManagement";

type Page =
  | "dashboard"
  | "students"
  | "attendance"
  | "fees"
  | "homework"
  | "notices"
  | "results"
  | "timetable"
  | "user_mgmt";

const baseNavItems: {
  id: Page;
  label: string;
  icon: React.ElementType;
  ocid: string;
  adminOnly?: boolean;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  { id: "students", label: "Students", icon: Users, ocid: "nav.students_link" },
  {
    id: "attendance",
    label: "Attendance",
    icon: ClipboardCheck,
    ocid: "nav.attendance_link",
  },
  { id: "fees", label: "Fees", icon: DollarSign, ocid: "nav.fees_link" },
  {
    id: "homework",
    label: "Homework",
    icon: BookOpen,
    ocid: "nav.homework_link",
  },
  {
    id: "notices",
    label: "Notice Board",
    icon: Megaphone,
    ocid: "nav.notices_link",
  },
  { id: "results", label: "Results", icon: Trophy, ocid: "nav.results_link" },
  {
    id: "timetable",
    label: "Timetable",
    icon: CalendarDays,
    ocid: "nav.timetable_link",
  },
  {
    id: "user_mgmt",
    label: "User Management",
    icon: ShieldCheck,
    ocid: "nav.user_mgmt_link",
    adminOnly: true,
  },
];

function AppContent() {
  const { currentUser, isLoading, logout } = useAuth();
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  const isAdmin = currentUser.role === UserRole.admin;

  const navItems = baseNavItems.filter((item) => !item.adminOnly || isAdmin);

  const pageComponents: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={setPage} />,
    students: <Students />,
    attendance: <Attendance />,
    fees: <Fees />,
    homework: <Homework />,
    notices: <Notices />,
    results: <Results />,
    timetable: <Timetable />,
    user_mgmt: isAdmin ? (
      <UserManagement />
    ) : (
      <Dashboard onNavigate={setPage} />
    ),
  };

  // If current page is user_mgmt and not admin, go back to dashboard
  const activePage = page === "user_mgmt" && !isAdmin ? "dashboard" : page;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col sidebar-bg transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-sidebar-accent-foreground">
            EduLite
          </span>
          <button
            type="button"
            className="ml-auto lg:hidden text-sidebar-foreground hover:text-sidebar-accent-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              data-ocid={item.ocid}
              onClick={() => {
                setPage(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5",
                activePage === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-accent-foreground truncate">
                {currentUser.displayName}
              </p>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-primary/20 text-primary capitalize">
                {currentUser.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            data-ocid="nav.logout_button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <p className="text-xs text-sidebar-foreground/40 text-center">
            &copy; {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sidebar-foreground/70 underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center gap-4 px-6 bg-card border-b border-border shrink-0 shadow-xs">
          <button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-semibold text-foreground">
            {navItems.find((n) => n.id === activePage)?.label ??
              (activePage === "user_mgmt" ? "User Management" : "Dashboard")}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {pageComponents[activePage]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
