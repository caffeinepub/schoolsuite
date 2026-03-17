import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddAttendance,
  useGetAllStudents,
  useGetAttendanceByClass,
} from "../hooks/useQueries";

const CLASSES = [
  "Toddlers-A",
  "Toddlers-B",
  "PlayGroup-A",
  "PlayGroup-B",
  "Nursery-A",
  "Nursery-B",
  "KG1-A",
  "KG1-B",
  "KG2-A",
  "KG2-B",
  "Grade1-A",
  "Grade1-B",
  "Grade2-A",
  "Grade2-B",
  "Grade3-A",
  "Grade3-B",
  "Grade4-A",
  "Grade4-B",
  "Grade5-A",
  "Grade5-B",
  "Grade6-A",
  "Grade6-B",
];

type AttStatus = "present" | "absent" | "late";

const today = new Date().toISOString().slice(0, 10);

const statusColors: Record<string, string> = {
  present: "badge-success",
  absent: "badge-destructive",
  late: "badge-warning",
};

export default function Attendance() {
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(today);
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: students, isLoading: studentsLoading } = useGetAllStudents();
  const { data: attendance, isLoading: attLoading } =
    useGetAttendanceByClass(classId);
  const addAttendance = useAddAttendance();

  const classStudents = classId
    ? (students ?? []).filter(
        (s) => `${s.grade.replace(" ", "")}-${s.section}` === classId,
      )
    : [];

  const handleSubmit = async () => {
    if (!classId || classStudents.length === 0) {
      toast.error("Select a class first");
      return;
    }
    setSubmitting(true);
    try {
      await Promise.all(
        classStudents.map((s) =>
          addAttendance.mutateAsync({
            studentId: s.id,
            date,
            status: statuses[Number(s.id).toString()] ?? "present",
            classId,
          }),
        ),
      );
      toast.success("Attendance saved");
      setStatuses({});
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger
                  className="w-48"
                  data-ocid="attendance.class_select"
                >
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {classId && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Mark Attendance — {classId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : classStudents.length === 0 ? (
              <p
                className="text-muted-foreground text-sm text-center py-6"
                data-ocid="attendance.empty_state"
              >
                No students in this class
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {classStudents.map((s) => (
                    <div
                      key={Number(s.id)}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border"
                    >
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Roll #{Number(s.rollNo)}
                        </p>
                      </div>
                      <RadioGroup
                        value={statuses[Number(s.id).toString()] ?? "present"}
                        onValueChange={(v) =>
                          setStatuses((prev) => ({
                            ...prev,
                            [Number(s.id).toString()]: v as AttStatus,
                          }))
                        }
                        className="flex gap-4"
                      >
                        {(["present", "absent", "late"] as AttStatus[]).map(
                          (st) => (
                            <div key={st} className="flex items-center gap-1.5">
                              <RadioGroupItem
                                value={st}
                                id={`${Number(s.id)}-${st}`}
                              />
                              <Label
                                htmlFor={`${Number(s.id)}-${st}`}
                                className="text-xs capitalize cursor-pointer"
                              >
                                {st}
                              </Label>
                            </div>
                          ),
                        )}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  data-ocid="attendance.submit_button"
                >
                  {submitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Save Attendance
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {classId && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Attendance History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {attLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Student ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(attendance ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground py-6"
                        >
                          No records
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...(attendance ?? [])]
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((a) => (
                          <TableRow key={`${Number(a.studentId)}-${a.date}`}>
                            <TableCell className="text-sm">
                              {Number(a.studentId)}
                            </TableCell>
                            <TableCell className="text-sm">{a.date}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status] ?? ""}`}
                              >
                                {a.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
