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
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddStudent,
  useDeleteStudent,
  useGetAllStudents,
  useUpdateStudent,
} from "../hooks/useQueries";
import type { Student } from "../hooks/useQueries";

const GRADES = [
  "Toddlers",
  "Play Group",
  "Nursery",
  "KG1",
  "KG2",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];
const SECTIONS = ["A", "B", "C"];

interface StudentForm {
  name: string;
  grade: string;
  section: string;
  rollNo: string;
  guardianName: string;
  guardianContact: string;
}

const emptyForm: StudentForm = {
  name: "",
  grade: "Grade 1",
  section: "A",
  rollNo: "",
  guardianName: "",
  guardianContact: "",
};

export default function Students() {
  const { data: students, isLoading } = useGetAllStudents();
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [search, setSearch] = useState("");

  const openAdd = () => {
    setEditStudent(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };
  const openEdit = (s: Student) => {
    setEditStudent(s);
    setForm({
      name: s.name,
      grade: s.grade,
      section: s.section,
      rollNo: Number(s.rollNo).toString(),
      guardianName: s.guardianName,
      guardianContact: s.guardianContact,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editStudent) {
        await updateStudent.mutateAsync({
          id: editStudent.id,
          ...form,
          rollNo: Number.parseInt(form.rollNo),
        });
        toast.success("Student updated");
      } else {
        await addStudent.mutateAsync({
          ...form,
          rollNo: Number.parseInt(form.rollNo),
        });
        toast.success("Student added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStudent.mutateAsync(deleteId);
      toast.success("Student deleted");
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = (students ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase()),
  );

  const isSaving = addStudent.isPending || updateStudent.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          data-ocid="students.search_input"
        />
        <Button onClick={openAdd} data-ocid="students.add_button">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="students.table">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade & Section</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground"
                        data-ocid="students.empty_state"
                      >
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((s, idx) => (
                      <TableRow
                        key={Number(s.id)}
                        data-ocid={`students.item.${idx + 1}`}
                      >
                        <TableCell className="font-mono font-semibold text-sm">
                          {Number(s.rollNo)}
                        </TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {s.grade} — {s.section}
                          </Badge>
                        </TableCell>
                        <TableCell>{s.guardianName}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {s.guardianContact}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(s)}
                              data-ocid={`students.edit_button.${idx + 1}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(s.id)}
                              data-ocid={`students.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="students.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Student name"
                  data-ocid="students.input"
                />
              </div>
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Select
                  value={form.section}
                  onValueChange={(v) => setForm((f) => ({ ...f, section: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Roll No</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={form.rollNo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rollNo: e.target.value }))
                  }
                  placeholder="Roll number"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Guardian Name</Label>
                <Input
                  required
                  value={form.guardianName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guardianName: e.target.value }))
                  }
                  placeholder="Guardian name"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Guardian Contact</Label>
                <Input
                  required
                  value={form.guardianContact}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guardianContact: e.target.value }))
                  }
                  placeholder="Phone number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="students.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                data-ocid="students.submit_button"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editStudent ? "Update" : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="students.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="students.delete_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
