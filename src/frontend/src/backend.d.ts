import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AuthResponse {
    token: string;
    user: UserAccount;
}
export interface Attendance {
    id: bigint;
    status: string;
    studentId: bigint;
    date: string;
    classId?: string;
}
export interface Stats {
    totalStudents: bigint;
    pendingFees: bigint;
    totalNotices: bigint;
}
export interface UserAccount {
    id: bigint;
    username: string;
    displayName: string;
    role: UserRole;
    passwordHash: string;
}
export interface TimetableEntry {
    id: bigint;
    startTime: string;
    subject: string;
    endTime: string;
    dayOfWeek: string;
    classId: string;
    teacherName: string;
    periodNum: bigint;
}
export interface Fee {
    id: bigint;
    status: string;
    studentId: bigint;
    feeType: string;
    dueDate: string;
    description: string;
    collectedBy: string;
    paidDate?: string;
    paidAmount: bigint;
    amount: bigint;
}
export interface Result {
    id: bigint;
    totalMarks: number;
    studentId: bigint;
    subject: string;
    marksObtained: number;
    grade: string;
    examName: string;
}
export interface GradeFeeAssignment {
    id: bigint;
    dueDate: string;
    feeTypeId: bigint;
    grade: string;
    amount: bigint;
}
export interface FeeType {
    id: bigint;
    name: string;
    description: string;
    defaultAmount: bigint;
}
export interface Notice {
    id: bigint;
    title: string;
    postedBy: Principal;
    content: string;
    createdAt: string;
}
export interface FeeSummary {
    totalCollected: bigint;
    totalPending: bigint;
    byFeeType: Array<[string, bigint, bigint]>;
}
export interface Homework {
    id: bigint;
    title: string;
    postedBy: Principal;
    subject: string;
    dueDate: string;
    description: string;
    classId: string;
}
export interface UserProfile {
    displayName: string;
    name: string;
    role: string;
}
export interface Student {
    id: bigint;
    guardianContact: string;
    name: string;
    section: string;
    grade: string;
    rollNo: bigint;
    guardianName: string;
}
export enum UserRole {
    admin = "admin",
    teacher = "teacher"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAttendance(token: string, studentId: bigint, date: string, status: string, classId: string | null): Promise<bigint>;
    addFee(token: string, studentId: bigint, amount: bigint, description: string, dueDate: string, paidDate: string | null, status: string, feeType: string, collectedBy: string, paidAmount: bigint): Promise<bigint>;
    addFeeType(token: string, name: string, description: string, defaultAmount: bigint): Promise<bigint>;
    addHomework(token: string, title: string, description: string, subject: string, classId: string, dueDate: string): Promise<bigint>;
    addNotice(token: string, title: string, content: string, createdAt: string): Promise<bigint>;
    addResult(token: string, studentId: bigint, subject: string, examName: string, marksObtained: number, totalMarks: number, grade: string): Promise<bigint>;
    addStudent(token: string, name: string, grade: string, section: string, rollNo: bigint, guardianName: string, guardianContact: string): Promise<bigint>;
    addTimetableEntry(token: string, classId: string, dayOfWeek: string, periodNum: bigint, subject: string, teacherName: string, startTime: string, endTime: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignFeeToGrade(token: string, grade: string, feeTypeId: bigint, amount: bigint, dueDate: string): Promise<bigint>;
    createTeacherAccount(adminToken: string, username: string, password: string, displayName: string): Promise<void>;
    dashboardStats(token: string): Promise<Stats>;
    deleteFee(token: string, id: bigint): Promise<void>;
    deleteFeeType(token: string, id: bigint): Promise<void>;
    deleteStudent(token: string, id: bigint): Promise<void>;
    deleteTeacherAccount(adminToken: string, targetUserId: bigint): Promise<void>;
    getAllFees(token: string): Promise<Array<Fee>>;
    getAllNotices(token: string): Promise<Array<Notice>>;
    getAllStudents(token: string): Promise<Array<Student>>;
    getAttendanceByClass(token: string, classId: string): Promise<Array<Attendance>>;
    getAttendanceByStudent(token: string, studentId: bigint): Promise<Array<Attendance>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCurrentUser(token: string): Promise<UserAccount | null>;
    getFeeSummary(token: string): Promise<FeeSummary>;
    getFeeTypes(token: string): Promise<Array<FeeType>>;
    getFeesByStudent(token: string, studentId: bigint): Promise<Array<Fee>>;
    getGradeFeeAssignments(token: string): Promise<Array<GradeFeeAssignment>>;
    getHomeworkByClass(token: string, classId: string): Promise<Array<Homework>>;
    getPendingFees(token: string): Promise<Array<Fee>>;
    getPendingFeesWithStudents(token: string): Promise<Array<[Fee, string]>>;
    getResultsByStudent(token: string, studentId: bigint): Promise<Array<Result>>;
    getStudent(token: string, id: bigint): Promise<Student | null>;
    getTimetableByClass(token: string, classId: string): Promise<Array<TimetableEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listTeachers(token: string): Promise<Array<UserAccount>>;
    login(username: string, password: string): Promise<AuthResponse>;
    logout(token: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedData(token: string): Promise<void>;
    updateFee(token: string, feeId: bigint, amount: bigint, description: string, dueDate: string, paidDate: string | null, status: string, feeType: string, collectedBy: string, paidAmount: bigint): Promise<void>;
    updateFeeType(token: string, id: bigint, name: string, description: string, defaultAmount: bigint): Promise<void>;
    updateStudent(token: string, id: bigint, name: string, grade: string, section: string, rollNo: bigint, guardianName: string, guardianContact: string): Promise<void>;
    updateTeacherAccount(adminToken: string, targetUserId: bigint, username: string, displayName: string): Promise<void>;
}
