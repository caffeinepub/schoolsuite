import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  IndianRupee,
  Megaphone,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import {
  useDashboardStats,
  useGetAllNotices,
  useGetPendingFeesWithStudents,
  useListTeachers,
} from "../hooks/useQueries";

type Page =
  | "dashboard"
  | "students"
  | "attendance"
  | "fees"
  | "homework"
  | "notices"
  | "results"
  | "timetable";

interface Props {
  onNavigate: (page: Page) => void;
}

const quickActions: {
  label: string;
  description: string;
  icon: React.ElementType;
  page: Page;
  color: string;
  bg: string;
}[] = [
  {
    label: "Students",
    description: "Manage student records and profiles",
    icon: Users,
    page: "students",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Attendance",
    description: "Track and record daily attendance",
    icon: ClipboardCheck,
    page: "attendance",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Fee Management",
    description: "Manage payments and pending fees",
    icon: IndianRupee,
    page: "fees",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    label: "Notice Board",
    description: "Post and view school announcements",
    icon: Megaphone,
    page: "notices",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Homework",
    description: "Assign and track homework tasks",
    icon: BookOpen,
    page: "homework",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    label: "Results",
    description: "View and record exam results",
    icon: Trophy,
    page: "results",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    label: "Timetable",
    description: "View and manage class schedules",
    icon: CalendarDays,
    page: "timetable",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

export default function Dashboard({ onNavigate }: Props) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: teachers, isLoading: teachersLoading } = useListTeachers();
  const { data: notices, isLoading: noticesLoading } = useGetAllNotices();
  const { data: pendingFeesWithStudents, isLoading: feesLoading } =
    useGetPendingFeesWithStudents();

  const recentNotices = notices
    ? [...notices]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3)
    : [];

  const pendingFeeRows = (pendingFeesWithStudents ?? [])
    .map(([fee, studentName]) => ({
      ...fee,
      studentName,
      pendingAmount: Math.max(0, Number(fee.amount) - Number(fee.paidAmount)),
    }))
    .filter((f) => f.pendingAmount > 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const statCards = [
    {
      label: "Total Students",
      icon: Users,
      value: stats ? Number(stats.totalStudents) : null,
      loading: statsLoading,
      color: "text-blue-600",
      bg: "bg-blue-50",
      gradient: "from-blue-50 to-blue-100/50",
    },
    {
      label: "Total Teachers",
      icon: GraduationCap,
      value: teachers ? teachers.length : null,
      loading: teachersLoading,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      gradient: "from-emerald-50 to-emerald-100/50",
    },
    {
      label: "Pending Fees",
      icon: IndianRupee,
      value: stats ? Number(stats.pendingFees) : null,
      loading: statsLoading,
      color: "text-amber-600",
      bg: "bg-amber-50",
      gradient: "from-amber-50 to-amber-100/50",
    },
    {
      label: "Total Notices",
      icon: Megaphone,
      value: stats ? Number(stats.totalNotices) : null,
      loading: statsLoading,
      color: "text-violet-600",
      bg: "bg-violet-50",
      gradient: "from-violet-50 to-violet-100/50",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-display font-bold text-foreground">
          Admin Dashboard
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          System overview and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              className={`shadow-card card-hover bg-gradient-to-br ${stat.gradient} border-0`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  {stat.loading ? (
                    <Skeleton className="h-9 w-14" />
                  ) : (
                    <span
                      className={`text-3xl font-display font-bold ${stat.color}`}
                    >
                      {stat.value ?? "—"}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.04 }}
              >
                <button
                  type="button"
                  onClick={() => onNavigate(action.page)}
                  className="w-full text-left p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all duration-150 group"
                >
                  <div
                    className={`${action.bg} ${action.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-150`}
                  >
                    <action.icon className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {action.description}
                  </p>
                </button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Fees Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-amber-600" />
            Pending Fees
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("fees")}
            className="text-primary text-xs"
          >
            View all
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {feesLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : pendingFeeRows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <IndianRupee className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No pending fees</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Student Name
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Fee Type
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Due Date
                    </th>
                    <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Pending Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingFeeRows.map((fee, idx) => {
                    const isOverdue =
                      fee.dueDate && new Date(fee.dueDate) < new Date();
                    return (
                      <tr
                        key={Number(fee.id)}
                        className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                          idx % 2 === 0 ? "" : "bg-muted/10"
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {fee.studentName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {fee.feeType || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              isOverdue
                                ? "bg-red-100 text-red-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {fee.dueDate
                              ? new Date(fee.dueDate).toLocaleDateString()
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-orange-600">
                          ₹{fee.pendingAmount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notices */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="font-display text-base">
            Recent Notices
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("notices")}
            className="text-primary text-xs"
          >
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {noticesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentNotices.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="notices.empty_state"
            >
              <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotices.map((notice) => (
                <div
                  key={Number(notice.id)}
                  className="p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <p className="font-semibold text-sm text-foreground">
                    {notice.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notice.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
