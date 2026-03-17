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
export interface Fee {
    id: bigint;
    status: string;
    studentId: bigint;
    dueDate: string;
    description: string;
    paidDate?: string;
    amount: bigint;
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
export interface Result {
    id: bigint;
    totalMarks: number;
    studentId: bigint;
    subject: string;
    marksObtained: number;
    grade: string;
    examName: string;
}
export interface Notice {
    id: bigint;
    title: string;
    postedBy: Principal;
    content: string;
    createdAt: string;
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
    addAttendance(studentId: bigint, date: string, status: string, classId: string | null): Promise<bigint>;
    addFee(studentId: bigint, amount: bigint, description: string, dueDate: string, paidDate: string | null, status: string): Promise<bigint>;
    addHomework(title: string, description: string, subject: string, classId: string, dueDate: string): Promise<bigint>;
    addNotice(title: string, content: string, createdAt: string): Promise<bigint>;
    addResult(studentId: bigint, subject: string, examName: string, marksObtained: number, totalMarks: number, grade: string): Promise<bigint>;
    addStudent(name: string, grade: string, section: string, rollNo: bigint, guardianName: string, guardianContact: string): Promise<bigint>;
    addTimetableEntry(classId: string, dayOfWeek: string, periodNum: bigint, subject: string, teacherName: string, startTime: string, endTime: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createTeacherAccount(adminToken: string, username: string, password: string, displayName: string): Promise<void>;
    dashboardStats(): Promise<Stats>;
    deleteStudent(id: bigint): Promise<void>;
    deleteTeacherAccount(adminToken: string, userId: bigint): Promise<void>;
    getAllNotices(): Promise<Array<Notice>>;
    getAllStudents(): Promise<Array<Student>>;
    getAttendanceByClass(classId: string): Promise<Array<Attendance>>;
    getAttendanceByStudent(studentId: bigint): Promise<Array<Attendance>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCurrentUser(token: string): Promise<UserAccount | null>;
    getFeesByStudent(studentId: bigint): Promise<Array<Fee>>;
    getHomeworkByClass(classId: string): Promise<Array<Homework>>;
    getPendingFees(): Promise<Array<Fee>>;
    getResultsByStudent(studentId: bigint): Promise<Array<Result>>;
    getStudent(id: bigint): Promise<Student | null>;
    getTimetableByClass(classId: string): Promise<Array<TimetableEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listTeachers(token: string): Promise<Array<UserAccount>>;
    login(username: string, password: string): Promise<AuthResponse>;
    logout(token: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedData(): Promise<void>;
    updateFeeStatus(feeId: bigint, status: string): Promise<void>;
    updateStudent(id: bigint, name: string, grade: string, section: string, rollNo: bigint, guardianName: string, guardianContact: string): Promise<void>;
    updateTeacherAccount(adminToken: string, userId: bigint, username: string, displayName: string): Promise<void>;
}
