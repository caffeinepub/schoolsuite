import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CalendarDays, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddTimetableEntry,
  useGetTimetableByClass,
} from "../hooks/useQueries";
import type { TimetableEntry } from "../hooks/useQueries";

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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Art",
  "Physical Education",
  "Computer Science",
  "Library",
  "Free Period",
];

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-50 text-blue-700 border-blue-100",
  Science: "bg-green-50 text-green-700 border-green-100",
  English: "bg-purple-50 text-purple-700 border-purple-100",
  History: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Geography: "bg-teal-50 text-teal-700 border-teal-100",
  Art: "bg-pink-50 text-pink-700 border-pink-100",
  "Physical Education": "bg-orange-50 text-orange-700 border-orange-100",
  "Computer Science": "bg-indigo-50 text-indigo-700 border-indigo-100",
  Library: "bg-stone-50 text-stone-600 border-stone-100",
  "Free Period": "bg-gray-50 text-gray-400 border-gray-100",
};

export default function Timetable() {
  const [classId, setClassId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    classId: "",
    dayOfWeek: "Monday",
    periodNum: "1",
    subject: "Mathematics",
    teacherName: "",
    startTime: "08:00",
    endTime: "08:45",
  });

  const { data: entries, isLoading } = useGetTimetableByClass(classId);
  const addEntry = useAddTimetableEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEntry.mutateAsync({
        ...form,
        periodNum: Number.parseInt(form.periodNum),
      });
      toast.success("Entry added");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to add entry");
    }
  };

  const grid: Record<number, Record<string, TimetableEntry>> = {};
  for (const p of PERIODS) {
    grid[p] = {};
  }
  for (const e of entries ?? []) {
    const p = Number(e.periodNum);
    if (grid[p]) grid[p][e.dayOfWeek] = e;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Label>Class:</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="w-48" data-ocid="timetable.class_select">
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
        <Button
          onClick={() => setDialogOpen(true)}
          data-ocid="timetable.add_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {!classId ? (
        <div className="text-center py-20 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Select a class to view timetable</p>
        </div>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Weekly Timetable — {classId}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-20">
                      Period
                    </th>
                    {DAYS.map((d) => (
                      <th
                        key={d}
                        className="px-3 py-3 text-center font-semibold text-muted-foreground min-w-[140px]"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((p) => (
                    <tr key={p} className="border-t border-border">
                      <td className="px-4 py-2 font-semibold text-muted-foreground">
                        <div className="text-xs font-bold">P{p}</div>
                      </td>
                      {DAYS.map((d) => {
                        const entry = grid[p][d];
                        return (
                          <td key={d} className="px-2 py-2">
                            {entry ? (
                              <div
                                className={`rounded-md border px-2.5 py-1.5 text-xs ${subjectColors[entry.subject] ?? "bg-muted text-foreground border-border"}`}
                              >
                                <p className="font-semibold">{entry.subject}</p>
                                <p className="text-[10px] opacity-75 mt-0.5">
                                  {entry.teacherName}
                                </p>
                                <p className="text-[10px] opacity-60">
                                  {entry.startTime}–{entry.endTime}
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-md border border-dashed border-border px-2.5 py-2 text-xs text-muted-foreground/40 text-center">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="timetable.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Add Timetable Entry
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select
                  value={form.classId}
                  onValueChange={(v) => setForm((f) => ({ ...f, classId: v }))}
                >
                  <SelectTrigger>
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
                <Label>Day</Label>
                <Select
                  value={form.dayOfWeek}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, dayOfWeek: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Period</Label>
                <Select
                  value={form.periodNum}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, periodNum: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((p) => (
                      <SelectItem key={p} value={p.toString()}>
                        Period {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <div className="col-span-2 space-y-1.5">
                <Label>Teacher Name</Label>
                <Input
                  required
                  value={form.teacherName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, teacherName: e.target.value }))
                  }
                  placeholder="Teacher name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endTime: e.target.value }))
                  }
                />
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
                disabled={addEntry.isPending}
                data-ocid="timetable.submit_button"
              >
                {addEntry.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Add Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
