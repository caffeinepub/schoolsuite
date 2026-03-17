import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddHomework, useGetHomeworkByClass } from "../hooks/useQueries";

const CLASSES = [
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

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-100 text-blue-700",
  Science: "bg-green-100 text-green-700",
  English: "bg-purple-100 text-purple-700",
  History: "bg-yellow-100 text-yellow-700",
  Geography: "bg-teal-100 text-teal-700",
  Art: "bg-pink-100 text-pink-700",
  "Physical Education": "bg-orange-100 text-orange-700",
  "Computer Science": "bg-indigo-100 text-indigo-700",
};

export default function Homework() {
  const [classId, setClassId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "Mathematics",
    classId: "",
    dueDate: "",
  });

  const { data: homework, isLoading } = useGetHomeworkByClass(classId);
  const addHomework = useAddHomework();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addHomework.mutateAsync(form);
      toast.success("Homework posted");
      setDialogOpen(false);
      setForm({
        title: "",
        description: "",
        subject: "Mathematics",
        classId: "",
        dueDate: "",
      });
    } catch {
      toast.error("Failed to post homework");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Label>Class:</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="w-48" data-ocid="homework.class_select">
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
          data-ocid="homework.add_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Homework
        </Button>
      </div>

      {!classId ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>Select a class to view homework</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (homework ?? []).length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="homework.empty_state"
        >
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>No homework for {classId}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(homework ?? []).map((hw) => (
            <Card key={Number(hw.id)} className="shadow-card card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-display text-sm">
                    {hw.title}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${subjectColors[hw.subject] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {hw.subject}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {hw.description}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  📅 Due: {hw.dueDate}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="homework.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Post Homework</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Homework title"
              />
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
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                required
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Assignment details..."
                rows={3}
              />
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
                disabled={addHomework.isPending}
                data-ocid="homework.submit_button"
              >
                {addHomework.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Post Homework
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
