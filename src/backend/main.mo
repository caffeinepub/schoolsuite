import Set "mo:core/Set";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Mixins
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data types
  public type Student = {
    id : Nat;
    name : Text;
    grade : Text;
    section : Text;
    rollNo : Int;
    guardianName : Text;
    guardianContact : Text;
  };

  public type Attendance = {
    id : Nat;
    studentId : Nat;
    date : Text;
    status : Text;
    classId : ?Text;
  };

  public type Fee = {
    id : Nat;
    studentId : Nat;
    amount : Int;
    description : Text;
    dueDate : Text;
    paidDate : ?Text;
    status : Text;
    feeType : Text;
    collectedBy : Text;
    paidAmount : Int;
  };

  public type Homework = {
    id : Nat;
    title : Text;
    description : Text;
    subject : Text;
    classId : Text;
    dueDate : Text;
    postedBy : Principal;
  };

  public type Notice = {
    id : Nat;
    title : Text;
    content : Text;
    postedBy : Principal;
    createdAt : Text;
  };

  public type Result = {
    id : Nat;
    studentId : Nat;
    subject : Text;
    examName : Text;
    marksObtained : Float;
    totalMarks : Float;
    grade : Text;
  };

  public type TimetableEntry = {
    id : Nat;
    classId : Text;
    dayOfWeek : Text;
    periodNum : Nat;
    subject : Text;
    teacherName : Text;
    startTime : Text;
    endTime : Text;
  };

  public type Stats = {
    totalStudents : Nat;
    pendingFees : Nat;
    totalNotices : Nat;
  };

  public type UserRole = {
    #admin;
    #teacher;
  };

  public type UserAccount = {
    id : Nat;
    username : Text;
    passwordHash : Text;
    role : UserRole;
    displayName : Text;
  };

  public type AuthResponse = {
    token : Text;
    user : UserAccount;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
    displayName : Text;
  };

  public type FeeType = {
    id : Nat;
    name : Text;
    description : Text;
    defaultAmount : Int;
  };

  public type GradeFeeAssignment = {
    id : Nat;
    grade : Text;
    feeTypeId : Nat;
    amount : Int;
    dueDate : Text;
  };

  public type FeeSummary = {
    totalCollected : Int;
    totalPending : Int;
    byFeeType : [(Text, Int, Int)];
  };

  // ============================================================
  // LEGACY STABLE VARIABLES - kept for upgrade compatibility
  // These existed in previous versions and cannot be dropped (M0169)
  // ============================================================
  // NOTE: users and sessions Maps were auto-stable via --default-persistent-actors
  let users = Map.empty<Text, UserAccount>();
  let sessions = Map.empty<Text, Text>();
  stable var userId = 1; // legacy ID counter - now also used as nextUserId

  // ============================================================
  // USER STORAGE: stable arrays (most reliable across upgrades)
  // ============================================================
  stable var userList : [UserAccount] = [];
  stable var sessionList : [(Text, Text)] = []; // (token, username)

  // Legacy stable vars kept for migration
  stable var userEntries : [(Text, UserAccount)] = [];
  stable var sessionEntries : [(Text, Text)] = [];

  // ============================================================
  // OTHER DATA: stable entries + runtime Maps
  // ============================================================
  stable var studentEntries : [(Nat, Student)] = [];
  stable var attendanceEntries : [(Nat, Attendance)] = [];
  stable var feeEntries : [(Nat, Fee)] = [];
  stable var homeworkEntries : [(Nat, Homework)] = [];
  stable var noticeEntries : [(Nat, Notice)] = [];
  stable var resultEntries : [(Nat, Result)] = [];
  stable var timetableEntries : [(Nat, TimetableEntry)] = [];
  stable var feeTypeEntries : [(Nat, FeeType)] = [];
  stable var gradeFeeAssignmentEntries : [(Nat, GradeFeeAssignment)] = [];
  stable var userProfileEntries : [(Principal, UserProfile)] = [];

  stable var studentId = 1;
  stable var attendanceId = 1;
  stable var feeId = 1;
  stable var homeworkId = 1;
  stable var noticeId = 1;
  stable var resultId = 1;
  stable var timetableId = 1;
  stable var feeTypeId = 1;
  stable var gradeFeeAssignmentId = 1;

  let students = Map.empty<Nat, Student>();
  let attendance = Map.empty<Nat, Attendance>();
  let fees = Map.empty<Nat, Fee>();
  let homework = Map.empty<Nat, Homework>();
  let notices = Map.empty<Nat, Notice>();
  let results = Map.empty<Nat, Result>();
  let timetable = Map.empty<Nat, TimetableEntry>();
  let feeTypes = Map.empty<Nat, FeeType>();
  let gradeFeeAssignments = Map.empty<Nat, GradeFeeAssignment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // ============================================================
  // USER HELPERS (operate on stable userList/sessionList)
  // ============================================================
  func getUserByUsername(uname : Text) : ?UserAccount {
    for (u in userList.values()) {
      if (u.username == uname) { return ?u };
    };
    null
  };

  func getUserByToken(token : Text) : ?UserAccount {
    for ((t, uname) in sessionList.values()) {
      if (t == token) { return getUserByUsername(uname) };
    };
    null
  };

  func upsertUser(user : UserAccount) {
    let buf = List.empty<UserAccount>();
    for (u in userList.values()) {
      if (u.username != user.username) { buf.add(u) };
    };
    buf.add(user);
    userList := buf.toArray();
  };

  func deleteUserByUsername(uname : Text) {
    let buf = List.empty<UserAccount>();
    for (u in userList.values()) {
      if (u.username != uname) { buf.add(u) };
    };
    userList := buf.toArray();
  };

  func addSession(token : Text, uname : Text) {
    let buf = List.empty<(Text, Text)>();
    for (s in sessionList.values()) { buf.add(s) };
    buf.add((token, uname));
    sessionList := buf.toArray();
  };

  func removeSession(token : Text) {
    let buf = List.empty<(Text, Text)>();
    for ((t, u) in sessionList.values()) {
      if (t != token) { buf.add((t, u)) };
    };
    sessionList := buf.toArray();
  };

  func isAdminToken(token : Text) : Bool {
    switch (getUserByToken(token)) {
      case (?user) { user.role == #admin };
      case (null) { false };
    };
  };

  func isAuthenticatedToken(token : Text) : Bool {
    switch (getUserByToken(token)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  func isAdminOrTeacherToken(token : Text) : Bool {
    switch (getUserByToken(token)) {
      case (?user) { user.role == #admin or user.role == #teacher };
      case (null) { false };
    };
  };

  func hashPassword(password : Text, username : Text) : Text {
    password # username
  };

  func verifyPassword(password : Text, hash : Text, username : Text) : Bool {
    hashPassword(password, username) == hash
  };

  func ensureAdminExists() {
    switch (getUserByUsername("admin")) {
      case (?user) {
        if (user.role != #admin) {
          upsertUser({ user with role = #admin; passwordHash = hashPassword("admin123", "admin") });
        };
      };
      case (null) {
        upsertUser({
          id = 0;
          username = "admin";
          passwordHash = hashPassword("admin123", "admin");
          role = #admin;
          displayName = "Admin User";
        });
      };
    };
  };

  // System hooks
  system func preupgrade() {
    studentEntries := students.toArray();
    attendanceEntries := attendance.toArray();
    feeEntries := fees.toArray();
    homeworkEntries := homework.toArray();
    noticeEntries := notices.toArray();
    resultEntries := results.toArray();
    timetableEntries := timetable.toArray();
    feeTypeEntries := feeTypes.toArray();
    gradeFeeAssignmentEntries := gradeFeeAssignments.toArray();
    userProfileEntries := userProfiles.toArray();
    // userList and sessionList are stable arrays - persist automatically
  };

  system func postupgrade() {
    for ((k, v) in studentEntries.values()) { students.add(k, v) };
    for ((k, v) in attendanceEntries.values()) { attendance.add(k, v) };
    for ((k, v) in feeEntries.values()) { fees.add(k, v) };
    for ((k, v) in homeworkEntries.values()) { homework.add(k, v) };
    for ((k, v) in noticeEntries.values()) { notices.add(k, v) };
    for ((k, v) in resultEntries.values()) { results.add(k, v) };
    for ((k, v) in timetableEntries.values()) { timetable.add(k, v) };
    for ((k, v) in feeTypeEntries.values()) { feeTypes.add(k, v) };
    for ((k, v) in gradeFeeAssignmentEntries.values()) { gradeFeeAssignments.add(k, v) };
    for ((k, v) in userProfileEntries.values()) { userProfiles.add(k, v) };

    // Migrate users from legacy Map-based storage (userEntries) if userList is empty
    if (userList.size() == 0 and userEntries.size() > 0) {
      let buf = List.empty<UserAccount>();
      var maxId : Nat = 0;
      for ((_, user) in userEntries.values()) {
        buf.add(user);
        if (user.id > maxId) { maxId := user.id };
      };
      userList := buf.toArray();
      userId := maxId + 1;
    };

    ensureAdminExists();

    if (feeTypes.isEmpty()) {
      let feeTypesToSeed = [
        { name = "Tuition"; description = "Monthly tuition fee"; defaultAmount = 5000 },
        { name = "Exam Fee"; description = "Fee for semester exams"; defaultAmount = 1000 },
        { name = "Transport Fee"; description = "Transportation charges"; defaultAmount = 2000 },
        { name = "Library Fee"; description = "Library services charges"; defaultAmount = 500 },
        { name = "Miscellaneous"; description = "Other charges"; defaultAmount = 300 },
      ];
      for (ft in feeTypesToSeed.values()) {
        feeTypes.add(feeTypeId, { id = feeTypeId; name = ft.name; description = ft.description; defaultAmount = ft.defaultAmount });
        feeTypeId += 1;
      };
    };
  };

  // Init block for fresh deployments
  do {
    ensureAdminExists();
    if (feeTypes.isEmpty() and feeTypeEntries.size() == 0) {
      let feeTypesToSeed = [
        { name = "Tuition"; description = "Monthly tuition fee"; defaultAmount = 5000 },
        { name = "Exam Fee"; description = "Fee for semester exams"; defaultAmount = 1000 },
        { name = "Transport Fee"; description = "Transportation charges"; defaultAmount = 2000 },
        { name = "Library Fee"; description = "Library services charges"; defaultAmount = 500 },
        { name = "Miscellaneous"; description = "Other charges"; defaultAmount = 300 },
      ];
      for (ft in feeTypesToSeed.values()) {
        feeTypes.add(feeTypeId, { id = feeTypeId; name = ft.name; description = ft.description; defaultAmount = ft.defaultAmount });
        feeTypeId += 1;
      };
    };
  };

  // User Profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller)
  };
  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user)
  };
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile)
  };

  // Authentication
  public shared func login(username : Text, password : Text) : async AuthResponse {
    ensureAdminExists();
    switch (getUserByUsername(username)) {
      case (?user) {
        if (verifyPassword(password, user.passwordHash, user.username)) {
          let token = username # user.passwordHash # user.id.toText();
          addSession(token, username);
          { token; user }
        } else {
          Runtime.trap("Invalid credentials")
        }
      };
      case (null) { Runtime.trap("Invalid credentials") };
    }
  };

  public shared func logout(token : Text) : async () {
    removeSession(token)
  };

  public shared func getCurrentUser(token : Text) : async ?UserAccount {
    getUserByToken(token)
  };

  // User management
  public shared func createTeacherAccount(adminToken : Text, username : Text, password : Text, displayName : Text) : async () {
    if (not isAdminToken(adminToken)) { Runtime.trap("Unauthorized") };
    if (username == "admin") { Runtime.trap("Username 'admin' is reserved") };
    switch (getUserByUsername(username)) {
      case (?_) { Runtime.trap("Username already exists") };
      case (null) {
        upsertUser({ id = userId; username; passwordHash = hashPassword(password, username); role = #teacher; displayName });
        userId += 1;
      };
    };
  };

  public shared func updateTeacherAccount(adminToken : Text, targetUserId : Nat, username : Text, displayName : Text) : async () {
    if (not isAdminToken(adminToken)) { Runtime.trap("Unauthorized") };
    switch (getUserByUsername(username)) {
      case (?user) { upsertUser({ user with displayName }) };
      case (null) { Runtime.trap("Teacher not found") };
    };
  };

  public shared func deleteTeacherAccount(adminToken : Text, targetUserId : Nat) : async () {
    if (not isAdminToken(adminToken)) { Runtime.trap("Unauthorized") };
    var found = false;
    for (u in userList.values()) {
      if (u.id == targetUserId and u.role == #teacher) {
        deleteUserByUsername(u.username);
        found := true;
      };
    };
    if (not found) { Runtime.trap("Teacher account not found") };
  };

  public shared func listTeachers(token : Text) : async [UserAccount] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    let buf = List.empty<UserAccount>();
    for (u in userList.values()) {
      if (u.role == #teacher) { buf.add(u) };
    };
    buf.toArray()
  };

  // Students
  public shared func addStudent(
    token : Text, name : Text, grade : Text, section : Text,
    rollNo : Int, guardianName : Text, guardianContact : Text,
  ) : async Nat {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    let s : Student = { id = studentId; name; grade; section; rollNo; guardianName; guardianContact };
    students.add(studentId, s);
    studentId += 1;
    s.id
  };

  public shared func updateStudent(
    token : Text, id : Nat, name : Text, grade : Text, section : Text,
    rollNo : Int, guardianName : Text, guardianContact : Text,
  ) : async () {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    switch (students.get(id)) {
      case (?_) { students.add(id, { id; name; grade; section; rollNo; guardianName; guardianContact }) };
      case (null) { Runtime.trap("Student not found") };
    };
  };

  public shared func deleteStudent(token : Text, id : Nat) : async () {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    if (students.containsKey(id)) { students.remove(id) }
    else { Runtime.trap("Student not found") };
  };

  public query func getStudent(token : Text, id : Nat) : async ?Student {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    students.get(id)
  };

  public query func getAllStudents(token : Text) : async [Student] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    students.values().toArray()
  };

  // Attendance
  public shared func addAttendance(
    token : Text, studentId : Nat, date : Text, status : Text, classId : ?Text,
  ) : async Nat {
    if (not isAdminOrTeacherToken(token)) { Runtime.trap("Unauthorized") };
    let a : Attendance = { id = attendanceId; studentId; date; status; classId };
    attendance.add(attendanceId, a);
    attendanceId += 1;
    a.id
  };

  public query func getAttendanceByStudent(token : Text, studentId : Nat) : async [Attendance] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    let buf = List.empty<Attendance>();
    for (a in attendance.values()) {
      if (a.studentId == studentId) { buf.add(a) };
    };
    buf.toArray()
  };

  public query func getAttendanceByClass(token : Text, classId : Text) : async [Attendance] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    let buf = List.empty<Attendance>();
    for (a in attendance.values()) {
      switch (a.classId) {
        case (?id) if (id == classId) { buf.add(a) };
        case (_) {};
      };
    };
    buf.toArray()
  };

  // Fees
  public shared func addFee(
    token : Text, studentId : Nat, amount : Int, description : Text,
    dueDate : Text, paidDate : ?Text, status : Text,
    feeType : Text, collectedBy : Text, paidAmount : Int,
  ) : async Nat {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    let f : Fee = { id = feeId; studentId; amount; description; dueDate; paidDate; status; feeType; collectedBy; paidAmount };
    fees.add(feeId, f);
    feeId += 1;
    f.id
  };

  public shared func updateFee(
    token : Text, feeId : Nat, amount : Int, description : Text,
    dueDate : Text, paidDate : ?Text, status : Text,
    feeType : Text, collectedBy : Text, paidAmount : Int,
  ) : async () {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    switch (fees.get(feeId)) {
      case (?f) {
        fees.add(feeId, { id = feeId; studentId = f.studentId; amount; description; dueDate; paidDate; status; feeType; collectedBy; paidAmount })
      };
      case (null) { Runtime.trap("Fee not found") };
    };
  };

  public shared func deleteFee(token : Text, id : Nat) : async () {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    if (fees.containsKey(id)) { fees.remove(id) }
    else { Runtime.trap("Fee not found") };
  };

  public query func getPendingFees(token : Text) : async [Fee] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    let buf = List.empty<Fee>();
    for (f in fees.values()) {
      if (f.status != "paid") { buf.add(f) };
    };
    buf.toArray()
  };

  public query func getFeesByStudent(token : Text, studentId : Nat) : async [Fee] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    let buf = List.empty<Fee>();
    for (f in fees.values()) {
      if (f.studentId == studentId) { buf.add(f) };
    };
    buf.toArray()
  };

  public query func getAllFees(token : Text) : async [Fee] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    fees.values().toArray()
  };

  public query func getFeeSummary(token : Text) : async FeeSummary {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    var totalCollected : Int = 0;
    var totalPending : Int = 0;
    let feeTypeTotals = Map.empty<Text, (Int, Int)>();
    for ((_, fee) in fees.entries()) {
      totalCollected += fee.paidAmount;
      totalPending += (fee.amount - fee.paidAmount);
      let cur = switch (feeTypeTotals.get(fee.feeType)) {
        case (?t) { t };
        case (null) { (0, 0) };
      };
      feeTypeTotals.add(fee.feeType, (cur.0 + fee.paidAmount, cur.1 + (fee.amount - fee.paidAmount)));
    };
    var byFeeType : [(Text, Int, Int)] = [];
    for ((ft, totals) in feeTypeTotals.entries()) {
      byFeeType := byFeeType.concat([(ft, totals.0, totals.1)]);
    };
    { totalCollected; totalPending; byFeeType }
  };

  public query func getPendingFeesWithStudents(token : Text) : async [(Fee, Text)] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    let buf = List.empty<(Fee, Text)>();
    for (f in fees.values()) {
      if (f.status != "paid") {
        let name = switch (students.get(f.studentId)) {
          case (?s) { s.name };
          case (null) { "Unknown" };
        };
        buf.add((f, name));
      };
    };
    buf.toArray()
  };

  // Fee types
  public shared func addFeeType(token : Text, name : Text, description : Text, defaultAmount : Int) : async Nat {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    let ft : FeeType = { id = feeTypeId; name; description; defaultAmount };
    feeTypes.add(feeTypeId, ft);
    feeTypeId += 1;
    ft.id
  };

  public query func getFeeTypes(token : Text) : async [FeeType] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    feeTypes.values().toArray()
  };

  public shared func updateFeeType(token : Text, id : Nat, name : Text, description : Text, defaultAmount : Int) : async () {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    switch (feeTypes.get(id)) {
      case (?_) { feeTypes.add(id, { id; name; description; defaultAmount }) };
      case (null) { Runtime.trap("Fee type not found") };
    };
  };

  public shared func deleteFeeType(token : Text, id : Nat) : async () {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    if (feeTypes.containsKey(id)) { feeTypes.remove(id) }
    else { Runtime.trap("Fee type not found") };
  };

  // Grade fee assignments
  public shared func assignFeeToGrade(token : Text, grade : Text, feeTypeId : Nat, amount : Int, dueDate : Text) : async Nat {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    let a : GradeFeeAssignment = { id = gradeFeeAssignmentId; grade; feeTypeId; amount; dueDate };
    gradeFeeAssignments.add(gradeFeeAssignmentId, a);
    gradeFeeAssignmentId += 1;
    a.id
  };

  public query func getGradeFeeAssignments(token : Text) : async [GradeFeeAssignment] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    gradeFeeAssignments.values().toArray()
  };

  // Homework
  public shared ({ caller }) func addHomework(
    token : Text, title : Text, description : Text, subject : Text, classId : Text, dueDate : Text,
  ) : async Nat {
    if (not isAdminOrTeacherToken(token)) { Runtime.trap("Unauthorized") };
    let h : Homework = { id = homeworkId; title; description; subject; classId; dueDate; postedBy = caller };
    homework.add(homeworkId, h);
    homeworkId += 1;
    h.id
  };

  public query func getHomeworkByClass(token : Text, classId : Text) : async [Homework] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    let buf = List.empty<Homework>();
    for (h in homework.values()) {
      if (h.classId == classId) { buf.add(h) };
    };
    buf.toArray()
  };

  // Notices
  public shared ({ caller }) func addNotice(token : Text, title : Text, content : Text, createdAt : Text) : async Nat {
    if (not isAdminOrTeacherToken(token)) { Runtime.trap("Unauthorized") };
    let n : Notice = { id = noticeId; title; content; postedBy = caller; createdAt };
    notices.add(noticeId, n);
    noticeId += 1;
    n.id
  };

  public query func getAllNotices(token : Text) : async [Notice] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    notices.values().toArray()
  };

  // Results
  public shared func addResult(
    token : Text, studentId : Nat, subject : Text, examName : Text,
    marksObtained : Float, totalMarks : Float, grade : Text,
  ) : async Nat {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    let r : Result = { id = resultId; studentId; subject; examName; marksObtained; totalMarks; grade };
    results.add(resultId, r);
    resultId += 1;
    r.id
  };

  public query func getResultsByStudent(token : Text, studentId : Nat) : async [Result] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    let buf = List.empty<Result>();
    for (r in results.values()) {
      if (r.studentId == studentId) { buf.add(r) };
    };
    buf.toArray()
  };

  // Timetable
  public shared func addTimetableEntry(
    token : Text, classId : Text, dayOfWeek : Text, periodNum : Nat,
    subject : Text, teacherName : Text, startTime : Text, endTime : Text,
  ) : async Nat {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    let e : TimetableEntry = { id = timetableId; classId; dayOfWeek; periodNum; subject; teacherName; startTime; endTime };
    timetable.add(timetableId, e);
    timetableId += 1;
    e.id
  };

  public query func getTimetableByClass(token : Text, classId : Text) : async [TimetableEntry] {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    let buf = List.empty<TimetableEntry>();
    for (t in timetable.values()) {
      if (t.classId == classId) { buf.add(t) };
    };
    buf.toArray()
  };

  // Dashboard
  public query func dashboardStats(token : Text) : async Stats {
    if (not isAuthenticatedToken(token)) { Runtime.trap("Unauthorized") };
    var pendingFees = 0;
    for (f in fees.values()) {
      if (f.status != "paid") { pendingFees += 1 };
    };
    { totalStudents = students.size(); pendingFees; totalNotices = notices.size() }
  };

  // Seed data
  public shared func seedData(token : Text) : async () {
    if (not isAdminToken(token)) { Runtime.trap("Unauthorized") };
    if (students.size() > 0) { Runtime.trap("Data already seeded") };
    let studentList = [
      { name = "John Doe"; grade = "Grade 5"; section = "A"; rollNo = 1; guardianName = "Jane Doe"; guardianContact = "12345678" },
      { name = "Mike Smith"; grade = "Grade 6"; section = "B"; rollNo = 2; guardianName = "Sara Smith"; guardianContact = "45673228" },
      { name = "Lisa Johnson"; grade = "Grade 5"; section = "A"; rollNo = 3; guardianName = "Bob Johnson"; guardianContact = "123452348" },
      { name = "David Brown"; grade = "Grade 6"; section = "B"; rollNo = 4; guardianName = "Rachel Brown"; guardianContact = "98765432" },
      { name = "Emily Williams"; grade = "Grade 5"; section = "A"; rollNo = 5; guardianName = "Mark Williams"; guardianContact = "56781234" },
    ];
    for (s in studentList.values()) {
      students.add(studentId, { id = studentId; name = s.name; grade = s.grade; section = s.section; rollNo = s.rollNo; guardianName = s.guardianName; guardianContact = s.guardianContact });
      studentId += 1;
    };
  };
};
