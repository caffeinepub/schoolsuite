import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetAllStudents,
  useGetFeesByStudent,
  useGetPendingFees,
  useUpdateFeeStatus,
} from "../hooks/useQueries";

const statusClass = (status: string) => {
  if (status === "paid") return "badge-success";
  if (status === "overdue") return "badge-destructive";
  return "badge-warning";
};

export default function Fees() {
  const [selectedStudentId, setSelectedStudentId] = useState<bigint | null>(
    null,
  );
  const { data: students } = useGetAllStudents();
  const { data: pendingFees, isLoading: pendingLoading } = useGetPendingFees();
  const { data: studentFees, isLoading: studentFeesLoading } =
    useGetFeesByStudent(selectedStudentId);
  const updateFee = useUpdateFeeStatus();

  const handleMarkPaid = async (feeId: bigint) => {
    try {
      await updateFee.mutateAsync({ feeId, status: "paid" });
      toast.success("Marked as paid");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <Tabs defaultValue="pending">
      <TabsList className="mb-4">
        <TabsTrigger value="pending">Pending Fees</TabsTrigger>
        <TabsTrigger value="by-student">By Student</TabsTrigger>
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
                <Table data-ocid="fees.table">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Student ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(pendingFees ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-muted-foreground"
                          data-ocid="fees.empty_state"
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
                          <TableCell className="font-mono text-sm">
                            {Number(fee.studentId)}
                          </TableCell>
                          <TableCell>{fee.description}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{Number(fee.amount).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {fee.dueDate}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(fee.status)}`}
                            >
                              {fee.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleMarkPaid(fee.id)}
                              disabled={updateFee.isPending}
                              data-ocid={`fees.mark_paid_button.${idx + 1}`}
                            >
                              {updateFee.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              Mark Paid
                            </Button>
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
            <SelectTrigger className="w-64" data-ocid="fees.student_select">
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

          {selectedStudentId && (
            <Card className="shadow-card">
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
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(studentFees ?? []).length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No fee records
                            </TableCell>
                          </TableRow>
                        ) : (
                          (studentFees ?? []).map((fee) => (
                            <TableRow key={Number(fee.id)}>
                              <TableCell>{fee.description}</TableCell>
                              <TableCell className="font-semibold">
                                ₹{Number(fee.amount).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-sm">
                                {fee.dueDate}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(fee.status)}`}
                                >
                                  {fee.status}
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
      </TabsContent>
    </Tabs>
  );
}
