import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Plus, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddResult,
  useGetAllStudents,
  useGetResultsByStudent,
} from "../hooks/useQueries";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Art",
  "Physical Education",
  "Computer Science",
];
const GRADES = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];

const gradeColors: Record<string, string> = {
  "A+": "badge-success",
  A: "badge-success",
  "B+": "bg-blue-50 text-blue-700",
  B: "bg-blue-50 text-blue-700",
  "C+": "badge-warning",
  C: "badge-warning",
  D: "badge-destructive",
  F: "badge-destructive",
};

export default function Results() {
  const [studentId, setStudentId] = useState<bigint | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    subject: "Mathematics",
    examName: "",
    marksObtained: "",
    totalMarks: "",
    grade: "A",
  });

  const { data: students } = useGetAllStudents();
  const { data: results, isLoading } = useGetResultsByStudent(studentId);
  const addResult = useAddResult();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addResult.mutateAsync({
        studentId: BigInt(form.studentId),
        subject: form.subject,
        examName: form.examName,
        marksObtained: Number.parseFloat(form.marksObtained),
        totalMarks: Number.parseFloat(form.totalMarks),
        grade: form.grade,
      });
      toast.success("Result added");
      setDialogOpen(false);
      setForm({
        studentId: "",
        subject: "Mathematics",
        examName: "",
        marksObtained: "",
        totalMarks: "",
        grade: "A",
      });
    } catch {
      toast.error("Failed to add result");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select onValueChange={(v) => setStudentId(BigInt(v))}>
          <SelectTrigger className="w-64" data-ocid="results.student_select">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {(students ?? []).map((s) => (
              <SelectItem key={Number(s.id)} value={Number(s.id).toString()}>
                {s.name} (Roll #{Number(s.rollNo)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => setDialogOpen(true)}
          data-ocid="results.add_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Result
        </Button>
      </div>

      {!studentId ? (
        <div className="text-center py-20 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Select a student to view results</p>
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Subject</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(results ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-10 text-muted-foreground"
                          data-ocid="results.empty_state"
                        >
                          No results yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      (results ?? []).map((r) => (
                        <TableRow key={Number(r.id)}>
                          <TableCell className="font-medium">
                            {r.subject}
                          </TableCell>
                          <TableCell>{r.examName}</TableCell>
                          <TableCell className="font-mono">
                            {r.marksObtained}/{r.totalMarks}
                          </TableCell>
                          <TableCell className="text-sm">
                            {((r.marksObtained / r.totalMarks) * 100).toFixed(
                              1,
                            )}
                            %
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${gradeColors[r.grade] ?? "bg-muted text-muted-foreground"}`}
                            >
                              {r.grade}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="results.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add Result</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Student</Label>
              <Select
                required
                value={form.studentId}
                onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {(students ?? []).map((s) => (
                    <SelectItem
                      key={Number(s.id)}
                      value={Number(s.id).toString()}
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Select
                  value={form.subject}
                  onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Exam Name</Label>
                <Input
                  required
                  value={form.examName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, examName: e.target.value }))
                  }
                  placeholder="e.g. Mid-term"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Marks Obtained</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={form.marksObtained}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, marksObtained: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Total Marks</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={form.totalMarks}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, totalMarks: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Grade</Label>
                <Select
                  value={form.grade}
                  onValueChange={(v) => setForm((f) => ({ ...f, grade: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addResult.isPending}
                data-ocid="results.submit_button"
              >
                {addResult.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Add Result
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
