import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Attendance,
  Fee,
  Homework,
  Notice,
  Result,
  Stats,
  Student,
  TimetableEntry,
} from "../backend";
import { useActor } from "./useActor";

export type {
  Student,
  Attendance,
  Fee,
  Homework,
  Notice,
  Result,
  TimetableEntry,
  Stats,
};

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Stats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.dashboardStats();
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
      return actor.getAllStudents();
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
      return actor.deleteStudent(id);
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
      return actor.getAllNotices();
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
      return actor.addNotice(p.title, p.content, new Date().toISOString());
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
      return actor.getAttendanceByClass(classId);
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
      return actor.addAttendance(p.studentId, p.date, p.status, p.classId);
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["attendance", vars.classId] }),
  });
}

export function useGetPendingFees() {
  const { actor, isFetching } = useActor();
  return useQuery<Fee[]>({
    queryKey: ["pendingFees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingFees();
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
      return actor.getFeesByStudent(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useUpdateFeeStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { feeId: bigint; status: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateFeeStatus(p.feeId, p.status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingFees"] });
      qc.invalidateQueries({ queryKey: ["fees"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
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
      status: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addFee(
        p.studentId,
        BigInt(p.amount),
        p.description,
        p.dueDate,
        null,
        p.status,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fees"] }),
  });
}

export function useGetHomeworkByClass(classId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Homework[]>({
    queryKey: ["homework", classId],
    queryFn: async () => {
      if (!actor || !classId) return [];
      return actor.getHomeworkByClass(classId);
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
      return actor.getResultsByStudent(studentId);
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
      return actor.getTimetableByClass(classId);
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
