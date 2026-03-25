import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Attendance,
  Fee,
  FeeSummary,
  FeeType,
  GradeFeeAssignment,
  Homework,
  Notice,
  Result,
  Stats,
  Student,
  TimetableEntry,
  UserAccount,
} from "../backend";
import { useActor } from "./useActor";

export type {
  Student,
  Attendance,
  Fee,
  FeeType,
  FeeSummary,
  GradeFeeAssignment,
  Homework,
  Notice,
  Result,
  TimetableEntry,
  Stats,
  UserAccount,
};

function getToken(): string {
  return localStorage.getItem("authToken") || "";
}

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Stats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.dashboardStats(getToken());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListTeachers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserAccount[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTeachers(getToken());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents(getToken());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      name: string;
      grade: string;
      section: string;
      rollNo: number;
      guardianName: string;
      guardianContact: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addStudent(
        getToken(),
        p.name,
        p.grade,
        p.section,
        BigInt(p.rollNo),
        p.guardianName,
        p.guardianContact,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id: bigint;
      name: string;
      grade: string;
      section: string;
      rollNo: number;
      guardianName: string;
      guardianContact: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudent(
        getToken(),
        p.id,
        p.name,
        p.grade,
        p.section,
        BigInt(p.rollNo),
        p.guardianName,
        p.guardianContact,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudent(getToken(), id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useGetAllNotices() {
  const { actor, isFetching } = useActor();
  return useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotices(getToken());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddNotice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { title: string; content: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.addNotice(
        getToken(),
        p.title,
        p.content,
        new Date().toISOString(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notices"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useGetAttendanceByClass(classId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Attendance[]>({
    queryKey: ["attendance", classId],
    queryFn: async () => {
      if (!actor || !classId) return [];
      return actor.getAttendanceByClass(getToken(), classId);
    },
    enabled: !!actor && !isFetching && !!classId,
  });
}

export function useAddAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      studentId: bigint;
      date: string;
      status: string;
      classId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addAttendance(
        getToken(),
        p.studentId,
        p.date,
        p.status,
        p.classId,
      );
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["attendance", vars.classId] }),
  });
}

// Fee hooks
export function useGetAllFees() {
  const { actor, isFetching } = useActor();
  return useQuery<Fee[]>({
    queryKey: ["allFees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFees(getToken());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingFees() {
  const { actor, isFetching } = useActor();
  return useQuery<Fee[]>({
    queryKey: ["pendingFees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingFees(getToken());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingFeesWithStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Fee, string]>>({
    queryKey: ["pendingFeesWithStudents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingFeesWithStudents(getToken());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFeesByStudent(studentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Fee[]>({
    queryKey: ["fees", studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getFeesByStudent(getToken(), studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useGetFeeSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<FeeSummary>({
    queryKey: ["feeSummary"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getFeeSummary(getToken());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFeeTypes() {
  const { actor, isFetching } = useActor();
  return useQuery<FeeType[]>({
    queryKey: ["feeTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeeTypes(getToken());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFeeType() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      name: string;
      description: string;
      defaultAmount: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addFeeType(
        getToken(),
        p.name,
        p.description,
        BigInt(p.defaultAmount),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feeTypes"] }),
  });
}

export function useUpdateFeeType() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id: bigint;
      name: string;
      description: string;
      defaultAmount: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateFeeType(
        getToken(),
        p.id,
        p.name,
        p.description,
        BigInt(p.defaultAmount),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feeTypes"] }),
  });
}

export function useDeleteFee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteFee(getToken(), id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feesByStudent"] });
      qc.invalidateQueries({ queryKey: ["pendingFees"] });
      qc.invalidateQueries({ queryKey: ["pendingFeesWithStudents"] });
      qc.invalidateQueries({ queryKey: ["allFees"] });
    },
  });
}

export function useDeleteFeeType() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteFeeType(getToken(), id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feeTypes"] }),
  });
}

export function useAddFee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      studentId: bigint;
      amount: number;
      description: string;
      dueDate: string;
      paidDate: string | null;
      status: string;
      feeType: string;
      collectedBy: string;
      paidAmount: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addFee(
        getToken(),
        p.studentId,
        BigInt(p.amount),
        p.description,
        p.dueDate,
        p.paidDate,
        p.status,
        p.feeType,
        p.collectedBy,
        BigInt(p.paidAmount),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allFees"] });
      qc.invalidateQueries({ queryKey: ["pendingFees"] });
      qc.invalidateQueries({ queryKey: ["pendingFeesWithStudents"] });
      qc.invalidateQueries({ queryKey: ["fees"] });
      qc.invalidateQueries({ queryKey: ["feeSummary"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateFee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      feeId: bigint;
      amount: number;
      description: string;
      dueDate: string;
      paidDate: string | null;
      status: string;
      feeType: string;
      collectedBy: string;
      paidAmount: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateFee(
        getToken(),
        p.feeId,
        BigInt(p.amount),
        p.description,
        p.dueDate,
        p.paidDate,
        p.status,
        p.feeType,
        p.collectedBy,
        BigInt(p.paidAmount),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allFees"] });
      qc.invalidateQueries({ queryKey: ["pendingFees"] });
      qc.invalidateQueries({ queryKey: ["pendingFeesWithStudents"] });
      qc.invalidateQueries({ queryKey: ["fees"] });
      qc.invalidateQueries({ queryKey: ["feeSummary"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useGetGradeFeeAssignments() {
  const { actor, isFetching } = useActor();
  return useQuery<GradeFeeAssignment[]>({
    queryKey: ["gradeFeeAssignments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGradeFeeAssignments(getToken());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignFeeToGrade() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      grade: string;
      feeTypeId: bigint;
      amount: number;
      dueDate: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignFeeToGrade(
        getToken(),
        p.grade,
        p.feeTypeId,
        BigInt(p.amount),
        p.dueDate,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["gradeFeeAssignments"] }),
  });
}

export function useGetHomeworkByClass(classId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Homework[]>({
    queryKey: ["homework", classId],
    queryFn: async () => {
      if (!actor || !classId) return [];
      return actor.getHomeworkByClass(getToken(), classId);
    },
    enabled: !!actor && !isFetching && !!classId,
  });
}

export function useAddHomework() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      title: string;
      description: string;
      subject: string;
      classId: string;
      dueDate: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addHomework(
        getToken(),
        p.title,
        p.description,
        p.subject,
        p.classId,
        p.dueDate,
      );
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["homework", vars.classId] }),
  });
}

export function useGetResultsByStudent(studentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Result[]>({
    queryKey: ["results", studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getResultsByStudent(getToken(), studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useAddResult() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      studentId: bigint;
      subject: string;
      examName: string;
      marksObtained: number;
      totalMarks: number;
      grade: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addResult(
        getToken(),
        p.studentId,
        p.subject,
        p.examName,
        p.marksObtained,
        p.totalMarks,
        p.grade,
      );
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({
        queryKey: ["results", vars.studentId.toString()],
      }),
  });
}

export function useGetTimetableByClass(classId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TimetableEntry[]>({
    queryKey: ["timetable", classId],
    queryFn: async () => {
      if (!actor || !classId) return [];
      return actor.getTimetableByClass(getToken(), classId);
    },
    enabled: !!actor && !isFetching && !!classId,
  });
}

export function useAddTimetableEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      classId: string;
      dayOfWeek: string;
      periodNum: number;
      subject: string;
      teacherName: string;
      startTime: string;
      endTime: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTimetableEntry(
        getToken(),
        p.classId,
        p.dayOfWeek,
        BigInt(p.periodNum),
        p.subject,
        p.teacherName,
        p.startTime,
        p.endTime,
      );
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["timetable", vars.classId] }),
  });
}
