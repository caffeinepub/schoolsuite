# EduLite

## Current State
EduLite is a school management app with 8 modules: Dashboard, Students, Attendance, Fees, Homework, Notice Board, Results, and Timetable. All features are publicly accessible with no login system. The backend stores students, attendance, fees, homework, notices, results, and timetable data.

## Requested Changes (Diff)

### Add
- Username/password login page shown to all unauthenticated users
- Two user roles: Admin and Teacher
- Backend user accounts store: username, hashed password, role, displayName
- Backend functions: login(username, password) -> session token, logout, getCurrentUser, createTeacher, updateTeacher, deleteTeacher, listTeachers
- A default admin account seeded on first run (username: admin, password: admin123)
- Session token stored in localStorage; sent with each API call
- Admin-only "User Management" page in sidebar to create/edit/delete teacher accounts
- After login, sidebar shows user's name and role with a Logout button
- Role-based access: Teachers can view all modules and add/edit data; Admins have all teacher permissions plus access to User Management page

### Modify
- App.tsx: wrap entire app in auth check; if no valid session, show LoginPage
- Sidebar: add user info footer and logout button; add "User Management" nav item visible only to Admin
- seedData: also seed the default admin account

### Remove
- Nothing removed from existing modules

## Implementation Plan
1. Backend: add UserAccount type, session store, login/logout/getCurrentUser, createTeacher/updateTeacher/deleteTeacher/listTeachers functions; seed admin account
2. Frontend LoginPage: username + password form, calls login(), stores token
3. Frontend AuthContext: provides currentUser and token to all components
4. Frontend App.tsx: show LoginPage if not logged in, else show app
5. Frontend sidebar: user info + logout button at bottom; User Management link for admin
6. Frontend UserManagement page: table of teacher accounts, add/edit/delete
