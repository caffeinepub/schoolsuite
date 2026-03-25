import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddFee,
  useAddFeeType,
  useAssignFeeToGrade,
  useDeleteFee,
  useDeleteFeeType,
  useGetAllFees,
  useGetAllStudents,
  useGetFeeSummary,
  useGetFeeTypes,
  useGetFeesByStudent,
  useGetGradeFeeAssignments,
  useGetPendingFees,
  useUpdateFee,
  useUpdateFeeType,
} from "../hooks/useQueries";
import type { Fee, FeeType } from "../hooks/useQueries";

const ALL_GRADES = [
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
  "Grade 1-A",
  "Grade 1-B",
  "Grade 2-A",
  "Grade 2-B",
  "Grade 3-A",
  "Grade 3-B",
  "Grade 4-A",
  "Grade 4-B",
  "Grade 5-A",
  "Grade 5-B",
  "Grade 6-A",
  "Grade 6-B",
];

const statusBadge = (status: string) => {
  if (status === "paid")
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        Paid
      </Badge>
    );
  if (status === "partial")
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        Partial
      </Badge>
    );
  if (status === "overdue")
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>
    );
  return (
    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
      Unpaid
    </Badge>
  );
};

const getPendingAmount = (fee: Fee) =>
  Math.max(0, Number(fee.amount) - Number(fee.paidAmount));

const PendingAmountCell = ({ fee }: { fee: Fee }) => {
  const pending = getPendingAmount(fee);
  return (
    <TableCell
      className={`font-semibold ${
        pending === 0 ? "text-green-600" : "text-orange-600"
      }`}
    >
      ₹{pending.toLocaleString()}
    </TableCell>
  );
};

function AddFeeDialog({
  feeTypes,
  students,
}: { feeTypes: FeeType[]; students: { id: bigint; name: string }[] }) {
  const addFee = useAddFee();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    feeType: "",
    amount: "",
    description: "",
    dueDate: "",
    status: "unpaid",
    collectedBy: "",
    paidDate: "",
    paidAmount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.feeType || !form.amount || !form.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await addFee.mutateAsync({
        studentId: BigInt(form.studentId),
        amount: Number(form.amount),
        description: form.description,
        dueDate: form.dueDate,
        paidDate: form.paidDate || null,
        status: form.status,
        feeType: form.feeType,
        collectedBy: form.collectedBy,
        paidAmount:
          Number(form.paidAmount) ||
          (form.status === "paid" ? Number(form.amount) : 0),
      });
      toast.success("Fee added successfully");
      setOpen(false);
      setForm({
        studentId: "",
        feeType: "",
        amount: "",
        description: "",
        dueDate: "",
        status: "unpaid",
        collectedBy: "",
        paidDate: "",
        paidAmount: "",
      });
    } catch {
      toast.error("Failed to add fee");
    }
  };

  const handleFeeTypeChange = (val: string) => {
    const ft = feeTypes.find((f) => f.name === val);
    setForm((prev) => ({
      ...prev,
      feeType: val,
      amount: ft ? Number(ft.defaultAmount).toString() : prev.amount,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Fee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Fee Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Student *</Label>
            <Select
              value={form.studentId}
              onValueChange={(v) => setForm((p) => ({ ...p, studentId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
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
          <div>
            <Label>Fee Type *</Label>
            <Select value={form.feeType} onValueChange={handleFeeTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select fee type" />
              </SelectTrigger>
              <SelectContent>
                {feeTypes.map((ft) => (
                  <SelectItem key={Number(ft.id)} value={ft.name}>
                    {ft.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="0"
              />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Optional note"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Collected By</Label>
              <Input
                value={form.collectedBy}
                onChange={(e) =>
                  setForm((p) => ({ ...p, collectedBy: e.target.value }))
                }
                placeholder="Staff name"
              />
            </div>
          </div>
          {(form.status === "paid" || form.status === "partial") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Paid Amount (₹)</Label>
                <Input
                  type="number"
                  value={form.paidAmount}
                  placeholder={form.status === "paid" ? form.amount : ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, paidAmount: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={form.paidDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, paidDate: e.target.value }))
                  }
                />
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={addFee.isPending}>
            {addFee.isPending ? "Adding..." : "Add Fee"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditFeeDialog({
  fee,
  feeTypes,
  onClose,
}: { fee: Fee; feeTypes: FeeType[]; onClose: () => void }) {
  const updateFee = useUpdateFee();
  const [form, setForm] = useState({
    amount: Number(fee.amount).toString(),
    description: fee.description,
    dueDate: fee.dueDate,
    paidDate: fee.paidDate ?? "",
    status: fee.status,
    feeType: fee.feeType,
    collectedBy: fee.collectedBy,
    paidAmount: Number(fee.paidAmount).toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateFee.mutateAsync({
        feeId: fee.id,
        amount: Number(form.amount),
        description: form.description,
        dueDate: form.dueDate,
        paidDate: form.paidDate || null,
        status: form.status,
        feeType: form.feeType,
        collectedBy: form.collectedBy,
        paidAmount:
          Number(form.paidAmount) ||
          (form.status === "paid" ? Number(form.amount) : 0),
      });
      toast.success("Fee updated");
      onClose();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label>Fee Type</Label>
        <Select
          value={form.feeType}
          onValueChange={(v) => setForm((p) => ({ ...p, feeType: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {feeTypes.map((ft) => (
              <SelectItem key={Number(ft.id)} value={ft.name}>
                {ft.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          />
        </div>
        <div>
          <Label>Due Date</Label>
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, dueDate: e.target.value }))
            }
          />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Input
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Collected By</Label>
          <Input
            value={form.collectedBy}
            onChange={(e) =>
              setForm((p) => ({ ...p, collectedBy: e.target.value }))
            }
          />
        </div>
      </div>
      {(form.status === "paid" || form.status === "partial") && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Paid Amount (₹)</Label>
            <Input
              type="number"
              value={form.paidAmount}
              placeholder={form.status === "paid" ? form.amount : ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, paidAmount: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Payment Date</Label>
            <Input
              type="date"
              value={form.paidDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, paidDate: e.target.value }))
              }
            />
          </div>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={updateFee.isPending}>
        {updateFee.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}

function FeeTypesTab() {
  const { data: feeTypes, isLoading } = useGetFeeTypes();
  const addFeeType = useAddFeeType();
  const updateFeeType = useUpdateFeeType();
  const deleteFeeType = useDeleteFeeType();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<FeeType | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    defaultAmount: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    defaultAmount: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    try {
      await addFeeType.mutateAsync({
        name: form.name,
        description: form.description,
        defaultAmount: Number(form.defaultAmount) || 0,
      });
      toast.success("Fee type added");
      setAddOpen(false);
      setForm({ name: "", description: "", defaultAmount: "" });
    } catch {
      toast.error("Failed to add fee type");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await updateFeeType.mutateAsync({
        id: editItem.id,
        name: editForm.name,
        description: editForm.description,
        defaultAmount: Number(editForm.defaultAmount) || 0,
      });
      toast.success("Fee type updated");
      setEditItem(null);
    } catch {
      toast.error("Failed to update fee type");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this fee type?")) return;
    try {
      await deleteFeeType.mutateAsync(id);
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Fee Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Fee Type</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Tuition"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Default Amount (₹)</Label>
                <Input
                  type="number"
                  value={form.defaultAmount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, defaultAmount: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={addFeeType.isPending}
              >
                {addFeeType.isPending ? "Adding..." : "Add"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Default Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(feeTypes ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No fee types defined
                    </TableCell>
                  </TableRow>
                ) : (
                  (feeTypes ?? []).map((ft) => (
                    <TableRow key={Number(ft.id)}>
                      <TableCell className="font-medium">{ft.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {ft.description}
                      </TableCell>
                      <TableCell>
                        ₹{Number(ft.defaultAmount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditItem(ft);
                              setEditForm({
                                name: ft.name,
                                description: ft.description,
                                defaultAmount: Number(
                                  ft.defaultAmount,
                                ).toString(),
                              });
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDelete(ft.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!editItem}
        onOpenChange={(o) => {
          if (!o) setEditItem(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Fee Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Default Amount (₹)</Label>
              <Input
                type="number"
                value={editForm.defaultAmount}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, defaultAmount: e.target.value }))
                }
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={updateFeeType.isPending}
            >
              {updateFeeType.isPending ? "Saving..." : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GradeAssignTab() {
  const { data: feeTypes } = useGetFeeTypes();
  const { data: assignments, isLoading } = useGetGradeFeeAssignments();
  const assignFee = useAssignFeeToGrade();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    grade: "",
    feeTypeId: "",
    amount: "",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.grade || !form.feeTypeId || !form.amount || !form.dueDate) {
      toast.error("All fields required");
      return;
    }
    try {
      await assignFee.mutateAsync({
        grade: form.grade,
        feeTypeId: BigInt(form.feeTypeId),
        amount: Number(form.amount),
        dueDate: form.dueDate,
      });
      toast.success("Fee assigned to grade");
      setOpen(false);
      setForm({ grade: "", feeTypeId: "", amount: "", dueDate: "" });
    } catch {
      toast.error("Failed to assign fee");
    }
  };

  const handleFeeTypeChange = (val: string) => {
    const ft = (feeTypes ?? []).find((f) => Number(f.id).toString() === val);
    setForm((p) => ({
      ...p,
      feeTypeId: val,
      amount: ft ? Number(ft.defaultAmount).toString() : p.amount,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Assign Fee to Grade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Assign Fee to Grade</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Grade *</Label>
                <Select
                  value={form.grade}
                  onValueChange={(v) => setForm((p) => ({ ...p, grade: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_GRADES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fee Type *</Label>
                <Select
                  value={form.feeTypeId}
                  onValueChange={handleFeeTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(feeTypes ?? []).map((ft) => (
                      <SelectItem
                        key={Number(ft.id)}
                        value={Number(ft.id).toString()}
                      >
                        {ft.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={assignFee.isPending}
              >
                {assignFee.isPending ? "Assigning..." : "Assign"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Grade</TableHead>
                  <TableHead>Fee Type ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(assignments ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No grade fee assignments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  (assignments ?? []).map((a) => (
                    <TableRow key={Number(a.id)}>
                      <TableCell>{a.grade}</TableCell>
                      <TableCell>{Number(a.feeTypeId)}</TableCell>
                      <TableCell>
                        ₹{Number(a.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{a.dueDate}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsTab() {
  const { data: summary, isLoading } = useGetFeeSummary();
  const { data: allFees, isLoading: feesLoading } = useGetAllFees();
  const { data: students } = useGetAllStudents();
  const studentMap = new Map(
    (students ?? []).map((s) => [Number(s.id), s.name]),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-green-600">
                ₹{Number(summary?.totalCollected ?? 0).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-orange-600">
                ₹{Number(summary?.totalPending ?? 0).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {!isLoading && (summary?.byFeeType ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Fee Type</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(summary?.byFeeType ?? []).map(
                  ([name, collected, pending]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-green-600">
                        ₹{Number(collected).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-orange-600">
                        ₹{Number(pending).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Fee Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {feesLoading ? (
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
                    <TableHead>Student</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Pending Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Collected By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(allFees ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No fee records
                      </TableCell>
                    </TableRow>
                  ) : (
                    (allFees ?? []).map((fee) => (
                      <TableRow key={Number(fee.id)}>
                        <TableCell className="font-medium">
                          {studentMap.get(Number(fee.studentId)) ??
                            `Student #${Number(fee.studentId)}`}
                        </TableCell>
                        <TableCell>{fee.feeType || fee.description}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{Number(fee.amount).toLocaleString()}
                        </TableCell>
                        <PendingAmountCell fee={fee} />
                        <TableCell className="text-sm">{fee.dueDate}</TableCell>
                        <TableCell className="text-sm">
                          {fee.paidDate ?? "-"}
                        </TableCell>
                        <TableCell>{statusBadge(fee.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {fee.collectedBy || "-"}
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
    </div>
  );
}

export default function Fees() {
  const [selectedStudentId, setSelectedStudentId] = useState<bigint | null>(
    null,
  );
  const [editFee, setEditFee] = useState<Fee | null>(null);
  const { data: students } = useGetAllStudents();
  const { data: feeTypes } = useGetFeeTypes();
  const { data: pendingFees, isLoading: pendingLoading } = useGetPendingFees();
  const { data: studentFees, isLoading: studentFeesLoading } =
    useGetFeesByStudent(selectedStudentId);
  const updateFee = useUpdateFee();
  const deleteFee = useDeleteFee();

  const studentMap = new Map(
    (students ?? []).map((s) => [Number(s.id), s.name]),
  );

  const handleMarkPaid = async (fee: Fee) => {
    try {
      await updateFee.mutateAsync({
        feeId: fee.id,
        amount: Number(fee.amount),
        description: fee.description,
        dueDate: fee.dueDate,
        paidDate: new Date().toISOString().split("T")[0],
        status: "paid",
        feeType: fee.feeType,
        collectedBy: fee.collectedBy,
        paidAmount: Number(fee.amount),
      });
      toast.success("Marked as paid");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddFeeDialog
          feeTypes={feeTypes ?? []}
          students={(students ?? []).map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending Fees</TabsTrigger>
          <TabsTrigger value="by-student">By Student</TabsTrigger>
          <TabsTrigger value="fee-types">Fee Types</TabsTrigger>
          <TabsTrigger value="grade-assign">Grade Assignment</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="shadow-card">
            <CardContent className="p-0">
              {pendingLoading ? (
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
                        <TableHead>Student</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Pending Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(pendingFees ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No pending fees
                          </TableCell>
                        </TableRow>
                      ) : (
                        (pendingFees ?? []).map((fee, idx) => (
                          <TableRow
                            key={Number(fee.id)}
                            data-ocid={`fees.item.${idx + 1}`}
                          >
                            <TableCell className="font-medium">
                              {studentMap.get(Number(fee.studentId)) ??
                                `Student #${Number(fee.studentId)}`}
                            </TableCell>
                            <TableCell>
                              {fee.feeType || fee.description}
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₹{Number(fee.amount).toLocaleString()}
                            </TableCell>
                            <PendingAmountCell fee={fee} />
                            <TableCell className="text-sm text-muted-foreground">
                              {fee.dueDate}
                            </TableCell>
                            <TableCell>{statusBadge(fee.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => handleMarkPaid(fee)}
                                  disabled={updateFee.isPending}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Mark Paid
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditFee(fee)}
                                >
                                  <Pencil className="w-4 h-4" />
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
        </TabsContent>

        <TabsContent value="by-student">
          <div className="space-y-4">
            <Select onValueChange={(v) => setSelectedStudentId(BigInt(v))}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {(students ?? []).map((s) => (
                  <SelectItem
                    key={Number(s.id)}
                    value={Number(s.id).toString()}
                  >
                    {s.name} (Roll #{Number(s.rollNo)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedStudentId && (
              <Card>
                <CardContent className="p-0">
                  {studentFeesLoading ? (
                    <div className="p-4 space-y-2">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-12" />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead>Fee Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Paid Amount</TableHead>
                            <TableHead>Pending Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Paid Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Collected By</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(studentFees ?? []).length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={9}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No fee records
                              </TableCell>
                            </TableRow>
                          ) : (
                            (studentFees ?? []).map((fee) => (
                              <TableRow key={Number(fee.id)}>
                                <TableCell>
                                  {fee.feeType || fee.description}
                                </TableCell>
                                <TableCell className="font-semibold">
                                  ₹{Number(fee.amount).toLocaleString()}
                                </TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  ₹{Number(fee.paidAmount).toLocaleString()}
                                </TableCell>
                                <PendingAmountCell fee={fee} />
                                <TableCell className="text-sm">
                                  {fee.dueDate}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {fee.paidDate ?? "-"}
                                </TableCell>
                                <TableCell>{statusBadge(fee.status)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {fee.collectedBy || "-"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => setEditFee(fee)}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="text-destructive"
                                      disabled={deleteFee.isPending}
                                      onClick={async () => {
                                        if (!confirm("Delete this fee record?"))
                                          return;
                                        try {
                                          await deleteFee.mutateAsync(fee.id);
                                          toast.success("Fee deleted");
                                        } catch {
                                          toast.error("Failed to delete fee");
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
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
            )}
          </div>
        </TabsContent>

        <TabsContent value="fee-types">
          <FeeTypesTab />
        </TabsContent>

        <TabsContent value="grade-assign">
          <GradeAssignTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!editFee}
        onOpenChange={(o) => {
          if (!o) setEditFee(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Fee Record</DialogTitle>
          </DialogHeader>
          {editFee && (
            <EditFeeDialog
              fee={editFee}
              feeTypes={feeTypes ?? []}
              onClose={() => setEditFee(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
