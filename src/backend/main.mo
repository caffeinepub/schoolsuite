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

  // Keep accessControlState to preserve stable variable compatibility
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

  // Persistent storage
  let students = Map.empty<Nat, Student>();
  let attendance = Map.empty<Nat, Attendance>();
  let fees = Map.empty<Nat, Fee>();
  let homework = Map.empty<Nat, Homework>();
  let notices = Map.empty<Nat, Notice>();
  let results = Map.empty<Nat, Result>();
  let timetable = Map.empty<Nat, TimetableEntry>();
  let users = Map.empty<Text, UserAccount>();
  let sessions = Map.empty<Text, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // ID counters
  var studentId = 1;
  var attendanceId = 1;
  var feeId = 1;
  var homeworkId = 1;
  var noticeId = 1;
  var resultId = 1;
  var timetableId = 1;
  var userId = 1;

  // Auth helpers - hash is password concatenated with username
  func hashPassword(password : Text, username : Text) : Text {
    password # username;
  };

  func verifyPassword(password : Text, hash : Text, username : Text) : Bool {
    hashPassword(password, username) == hash;
  };

  // Initialize default admin account at startup
  do {
    if (not users.containsKey("admin")) {
      let adminUser : UserAccount = {
        id = 0;
        username = "admin";
        passwordHash = hashPassword("admin123", "admin");
        role = #admin;
        displayName = "Admin User";
      };
      users.add("admin", adminUser);
    };
  };

  // User Profile functions (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Authentication functions
  public shared ({ caller }) func login(username : Text, password : Text) : async AuthResponse {
    switch (users.get(username)) {
      case (?user) {
        let isValid = verifyPassword(password, user.passwordHash, user.username);

        if (isValid) {
          let token = username # user.passwordHash # user.id.toText();
          sessions.add(token, username);
          { token; user };
        } else {
          Runtime.trap("Invalid credentials");
        };
      };
      case (null) { Runtime.trap("Invalid credentials") };
    };
  };

  public shared ({ caller }) func logout(token : Text) : async () {
    if (sessions.containsKey(token)) {
      sessions.remove(token);
    } else {
      Runtime.trap("Invalid session");
    };
  };

  public shared ({ caller }) func getCurrentUser(token : Text) : async ?UserAccount {
    switch (sessions.get(token)) {
      case (?userId) { users.get(userId) };
      case (null) { null };
    };
  };

  // User management functions
  public shared ({ caller }) func createTeacherAccount(adminToken : Text, username : Text, password : Text, displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create teacher accounts");
    };

    switch (sessions.get(adminToken)) {
      case (?adminId) {
        switch (users.get(adminId)) {
          case (?adminUser) {
            if (adminUser.role == #admin) {
              let hashedPassword = hashPassword(password, username);
              let newUser : UserAccount = {
                id = userId;
                username;
                passwordHash = hashedPassword;
                role = #teacher;
                displayName;
              };
              users.add(username, newUser);
              userId += 1;
            } else { Runtime.trap("Only admins can create teacher accounts") };
          };
          case (null) { Runtime.trap("Admin account not found") };
        };
      };
      case (null) { Runtime.trap("Invalid admin token") };
    };
  };

  public shared ({ caller }) func updateTeacherAccount(adminToken : Text, userId : Nat, username : Text, displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update teacher accounts");
    };

    switch (sessions.get(adminToken)) {
      case (?adminId) {
        switch (users.get(adminId)) {
          case (?adminUser) {
            if (adminUser.role == #admin) {
              switch (users.get(username)) {
                case (?teacher) {
                  let updatedUser = {
                    teacher with displayName;
                  };
                  users.add(username, updatedUser);
                };
                case (null) { Runtime.trap("Teacher account not found") };
              };
            } else { Runtime.trap("Only admins can update teacher accounts") };
          };
          case (null) { Runtime.trap("Admin account not found") };
        };
      };
      case (null) { Runtime.trap("Invalid admin token") };
    };
  };

  public shared ({ caller }) func deleteTeacherAccount(adminToken : Text, userId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete teacher accounts");
    };

    switch (sessions.get(adminToken)) {
      case (?adminId) {
        switch (users.get(adminId)) {
          case (?adminUser) {
            if (adminUser.role == #admin) {
              switch (users.get(userId.toText())) {
                case (?_) { users.remove(userId.toText()) };
                case (null) { Runtime.trap("Teacher account not found") };
              };
            } else { Runtime.trap("Only admins can delete teacher accounts") };
          };
          case (null) { Runtime.trap("Admin account not found") };
        };
      };
      case (null) { Runtime.trap("Invalid admin token") };
    };
  };

  public shared ({ caller }) func listTeachers(token : Text) : async [UserAccount] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list teachers");
    };

    switch (sessions.get(token)) {
      case (?_) {
        let teachersList = List.empty<UserAccount>();
        for ((_, user) in users.entries()) {
          if (user.role == #teacher) {
            teachersList.add(user);
          };
        };
        teachersList.toArray();
      };
      case (null) { Runtime.trap("Invalid session token") };
    };
  };

  // Student management functions
  public shared ({ caller }) func addStudent(
    name : Text,
    grade : Text,
    section : Text,
    rollNo : Int,
    guardianName : Text,
    guardianContact : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add students");
    };

    let newStudent : Student = {
      id = studentId;
      name;
      grade;
      section;
      rollNo;
      guardianName;
      guardianContact;
    };
    students.add(studentId, newStudent);
    studentId += 1;
    newStudent.id;
  };

  public shared ({ caller }) func updateStudent(
    id : Nat,
    name : Text,
    grade : Text,
    section : Text,
    rollNo : Int,
    guardianName : Text,
    guardianContact : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update students");
    };

    switch (students.get(id)) {
      case (?_) {
        let updatedStudent : Student = {
          id;
          name;
          grade;
          section;
          rollNo;
          guardianName;
          guardianContact;
        };
        students.add(id, updatedStudent);
      };
      case (null) { Runtime.trap("Student not found") };
    };
  };

  public shared ({ caller }) func deleteStudent(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };

    if (students.containsKey(id)) {
      students.remove(id);
    } else {
      Runtime.trap("Student not found");
    };
  };

  public query ({ caller }) func getStudent(id : Nat) : async ?Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view students");
    };
    students.get(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view students");
    };
    students.values().toArray();
  };

  // Attendance functions
  public shared ({ caller }) func addAttendance(
    studentId : Nat,
    date : Text,
    status : Text,
    classId : ?Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add attendance");
    };

    let newAttendance : Attendance = {
      id = attendanceId;
      studentId;
      date;
      status;
      classId;
    };
    attendance.add(attendanceId, newAttendance);
    attendanceId += 1;
    newAttendance.id;
  };

  public query ({ caller }) func getAttendanceByStudent(studentId : Nat) : async [Attendance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance");
    };

    let attendanceList = List.empty<Attendance>();
    for (a in attendance.values()) {
      if (a.studentId == studentId) {
        attendanceList.add(a);
      };
    };
    attendanceList.toArray();
  };

  public query ({ caller }) func getAttendanceByClass(classId : Text) : async [Attendance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance");
    };

    let attendanceList = List.empty<Attendance>();
    for (a in attendance.values()) {
      switch (a.classId) {
        case (?id) if (id == classId) { attendanceList.add(a) };
        case (_) {};
      };
    };
    attendanceList.toArray();
  };

  // Fee management functions
  public shared ({ caller }) func addFee(
    studentId : Nat,
    amount : Int,
    description : Text,
    dueDate : Text,
    paidDate : ?Text,
    status : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add fees");
    };

    let newFee : Fee = {
      id = feeId;
      studentId;
      amount;
      description;
      dueDate;
      paidDate;
      status;
    };
    fees.add(feeId, newFee);
    feeId += 1;
    newFee.id;
  };

  public shared ({ caller }) func updateFeeStatus(feeId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update fees");
    };

    switch (fees.get(feeId)) {
      case (?fee) {
        let updatedFee = { fee with status };
        fees.add(feeId, updatedFee);
      };
      case (null) { Runtime.trap("Fee not found") };
    };
  };

  public query ({ caller }) func getPendingFees() : async [Fee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view fees");
    };

    let feeList = List.empty<Fee>();
    for (f in fees.values()) {
      if (f.status == "pending") {
        feeList.add(f);
      };
    };
    feeList.toArray();
  };

  public query ({ caller }) func getFeesByStudent(studentId : Nat) : async [Fee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view fees");
    };

    let feeList = List.empty<Fee>();
    for (f in fees.values()) {
      if (f.studentId == studentId) {
        feeList.add(f);
      };
    };
    feeList.toArray();
  };

  // Homework functions
  public shared ({ caller }) func addHomework(
    title : Text,
    description : Text,
    subject : Text,
    classId : Text,
    dueDate : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add homework");
    };

    let newHomework : Homework = {
      id = homeworkId;
      title;
      description;
      subject;
      classId;
      dueDate;
      postedBy = caller;
    };
    homework.add(homeworkId, newHomework);
    homeworkId += 1;
    newHomework.id;
  };

  public query ({ caller }) func getHomeworkByClass(classId : Text) : async [Homework] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view homework");
    };

    let homeworkList = List.empty<Homework>();
    for (h in homework.values()) {
      if (h.classId == classId) {
        homeworkList.add(h);
      };
    };
    homeworkList.toArray();
  };

  // Notice functions
  public shared ({ caller }) func addNotice(title : Text, content : Text, createdAt : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add notices");
    };

    let newNotice : Notice = {
      id = noticeId;
      title;
      content;
      postedBy = caller;
      createdAt;
    };
    notices.add(noticeId, newNotice);
    noticeId += 1;
    newNotice.id;
  };

  public query ({ caller }) func getAllNotices() : async [Notice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notices");
    };
    notices.values().toArray();
  };

  // Results functions
  public shared func addResult(
    studentId : Nat,
    subject : Text,
    examName : Text,
    marksObtained : Float,
    totalMarks : Float,
    grade : Text,
  ) : async Nat {
    let newResult : Result = {
      id = resultId;
      studentId;
      subject;
      examName;
      marksObtained;
      totalMarks;
      grade;
    };
    results.add(resultId, newResult);
    resultId += 1;
    newResult.id;
  };

  public query ({ caller }) func getResultsByStudent(studentId : Nat) : async [Result] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view results");
    };

    let resultList = List.empty<Result>();
    for (r in results.values()) {
      if (r.studentId == studentId) {
        resultList.add(r);
      };
    };
    resultList.toArray();
  };

  // Timetable functions
  public shared ({ caller }) func addTimetableEntry(
    classId : Text,
    dayOfWeek : Text,
    periodNum : Nat,
    subject : Text,
    teacherName : Text,
    startTime : Text,
    endTime : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add timetable entries");
    };

    let newEntry : TimetableEntry = {
      id = timetableId;
      classId;
      dayOfWeek;
      periodNum;
      subject;
      teacherName;
      startTime;
      endTime;
    };
    timetable.add(timetableId, newEntry);
    timetableId += 1;
    newEntry.id;
  };

  public query ({ caller }) func getTimetableByClass(classId : Text) : async [TimetableEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view timetable");
    };

    let timetableList = List.empty<TimetableEntry>();
    for (t in timetable.values()) {
      if (t.classId == classId) {
        timetableList.add(t);
      };
    };
    timetableList.toArray();
  };

  public query ({ caller }) func dashboardStats() : async Stats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view dashboard stats");
    };

    let totalStudents = students.size();
    var pendingFees = 0;
    let totalNotices = notices.size();

    for (f in fees.values()) {
      if (f.status == "pending") {
        pendingFees += 1;
      };
    };

    {
      totalStudents;
      pendingFees;
      totalNotices;
    };
  };

  public shared ({ caller }) func seedData() : async () {
    if (students.size() > 0) {
      Runtime.trap("Data already seeded");
    };

    let studentList = [
      {
        name = "John Doe";
        grade = "Grade 5";
        section = "A";
        rollNo = 1;
        guardianName = "Jane Doe";
        guardianContact = "12345678";
      },
      {
        name = "Mike Smith";
        grade = "Grade 6";
        section = "B";
        rollNo = 2;
        guardianName = "Sara Smith";
        guardianContact = "45673228";
      },
      {
        name = "Lisa Johnson";
        grade = "Grade 5";
        section = "A";
        rollNo = 3;
        guardianName = "Bob Johnson";
        guardianContact = "123452348";
      },
      {
        name = "David Brown";
        grade = "Grade 6";
        section = "B";
        rollNo = 4;
        guardianName = "Rachel Brown";
        guardianContact = "98765432";
      },
      {
        name = "Emily Williams";
        grade = "Grade 5";
        section = "A";
        rollNo = 5;
        guardianName = "Mark Williams";
        guardianContact = "56781234";
      },
    ];

    for (s in studentList.values()) {
      let newStudent : Student = {
        id = studentId;
        name = s.name;
        grade = s.grade;
        section = s.section;
        rollNo = s.rollNo;
        guardianName = s.guardianName;
        guardianContact = s.guardianContact;
      };
      students.add(studentId, newStudent);
      studentId += 1;
    };
  };
};
