import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  IndianRupee,
  Megaphone,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useDashboardStats, useGetAllNotices } from "../hooks/useQueries";

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
  icon: React.ElementType;
  page: Page;
  color: string;
}[] = [
  {
    label: "Add Student",
    icon: Users,
    page: "students",
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Take Attendance",
    icon: ClipboardCheck,
    page: "attendance",
    color: "text-green-600 bg-green-50",
  },
  {
    label: "Manage Fees",
    icon: IndianRupee,
    page: "fees",
    color: "text-yellow-600 bg-yellow-50",
  },
  {
    label: "Post Notice",
    icon: Megaphone,
    page: "notices",
    color: "text-purple-600 bg-purple-50",
  },
  {
    label: "Add Homework",
    icon: BookOpen,
    page: "homework",
    color: "text-orange-600 bg-orange-50",
  },
  {
    label: "View Results",
    icon: Trophy,
    page: "results",
    color: "text-rose-600 bg-rose-50",
  },
  {
    label: "Timetable",
    icon: CalendarDays,
    page: "timetable",
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    label: "Reports",
    icon: TrendingUp,
    page: "results",
    color: "text-teal-600 bg-teal-50",
  },
];

export default function Dashboard({ onNavigate }: Props) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: notices, isLoading: noticesLoading } = useGetAllNotices();

  const recentNotices = notices
    ? [...notices]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Students",
            icon: Users,
            value: stats ? Number(stats.totalStudents) : null,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Pending Fees",
            icon: IndianRupee,
            value: stats ? Number(stats.pendingFees) : null,
            color: "text-warning",
            bg: "bg-warning/10",
          },
          {
            label: "Total Notices",
            icon: Megaphone,
            value: stats ? Number(stats.totalNotices) : null,
            color: "text-success",
            bg: "bg-success/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="shadow-card card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-display font-bold text-foreground mt-0.5">
                        {stat.value ?? "—"}
                      </p>
                    )}
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.04 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto flex-col gap-2 py-4 card-hover"
                  onClick={() => onNavigate(action.page)}
                >
                  <div className={`${action.color} p-2 rounded-lg`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
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
