# Inspirare Frontend

React + Vite + Tailwind frontend for Inspirare, connected to the live
Inspirare API at `https://inspirare-api.vercel.app/api`.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

`zustand` was added as a new dependency for the auth store (see below) —
run `npm install` again even if you already had `node_modules` from
before.

## Structure

```
src/
  api/              client.js (fetch wrapper, auth header, error shaping,
                     reads VITE_API_URL or VITE_API_BASE_URL)
                     auth.js, dashboard.js, courses.js, lessons.js,
                     assignments.js, admin.js
  stores/           authStore.js — Zustand store, single source of truth
                     for profile/session state
  context/          AuthContext.jsx — thin compatibility wrapper around
                     the store (same useAuth() shape as before)
  routes/           AdminRoute.jsx — guards the /admin/* route tree
  components/
    auth/            AuthLayout, LoginForm, AuthGuard,
                      BlockAdminFromAppArea
    layout/          AppShell (shared frame), SideNav (desktop wave
                      sidebar), MobileNav (bottom bar + "More" sheet),
                      Topbar, navConfig (nav items per role),
                      AppLayout (student/instructor)
    dashboard/       WelcomeCard, ProgressCard, UpcomingAssignments,
                      PerformanceCard, InstructorSummary
    courses/         CourseCard, ModuleAccordion
    assignments/     AssignmentCard
    ui/              Button, Input, Card, Progress, Avatar, LoadingState,
                      EmptyState, ErrorState, SectionErrorBoundary
  layouts/           AdminLayout.jsx — admin page heading inside the
                      shared AppShell
  features/admin/
    components/      AdminUi.jsx (StatCard,
                      StatusBadge, SearchInput, AdminSelect,
                      LoadingState/EmptyState/ErrorState, ConfirmDialog,
                      AdminButton), DataTable.jsx,
                      RegisterIndividual.jsx
  pages/             Login, RoleHome, Dashboard, Courses,
                      CourseDetail, Assignments, Settings, Placeholder,
                      Unauthorized, NotFound
  pages/admin/       AdminDashboard, AdminUsers, AdminStudents, AdminCourses,
                      AdminEnrollments, AdminSettings
```

## Auth flow

1. `/login` calls the API, stores `access_token` / `refresh_token` in
   `localStorage`. There is **no public registration** — accounts are created
   by an admin (`Register individual` on the admin dashboard).
2. `useAuthStore` (Zustand, `src/stores/authStore.js`) then calls
   `GET /auth/me` and uses that profile — never a frontend guess — as the
   source of truth for name/role/avatar/track.
3. On every page load, the store re-validates the stored token against
   `/auth/me` before treating the user as signed in. A role read only from
   `localStorage` is never trusted on its own.
4. A `401` from any request clears the session and routes to `/login`
   automatically (`registerUnauthorizedHandler` in `api/client.js`).
5. After login, the redirect is role-based: `admin` → `/admin`,
   everyone else → `/dashboard` (or wherever they were originally trying
   to reach, if they hit a protected route while signed out).
6. `RequireAuth` protects every authenticated route. Inside that,
   `BlockAdminFromAppArea` keeps admins out of the student/instructor app
   (redirects them to `/admin`), and `AdminRoute` keeps everyone else out
   of `/admin/*` (redirects to `/unauthorized`) — **the route itself is
   guarded, not just the sidebar link.**
7. `src/context/AuthContext.jsx` is now just a compatibility wrapper over
   the Zustand store, so every component that already called `useAuth()`
   kept working unchanged.

## Admin system

### Creating accounts

There is no public registration page. The admin dashboard has a
**Register individual** section that creates account for anyone (student,
instructor, or admin) with a generated password, and prints the email +
password credentials so they can be handed off. The `/admin/users` page
lists every account and lets the admin reassign roles (`student`,
`instructor`, `admin`) — a user can't change their own role.

### Routes

| Route | Page |
|---|---|
| `/admin` | Platform overview: total students/instructors/courses/enrollments (real `GET /dashboard` aggregate for an admin), published/unpublished split + recent courses (derived from `GET /admin/courses`), quick actions, and the **Register individual** section |
| `/admin/users` | `GET /admin/users` + `PATCH /admin/profiles/:id` — every account, per-row role selector (reassign roles, promote to admin/instructor) |
| `/admin/students` | `GET /admin/students` + `GET /admin/enrollments` — search, per-row **enrolled** badge showing the current course, "Enroll"/"Manage" action |
| `/admin/courses` | `GET /admin/courses` + `POST /admin/courses` (new course with instructor picker) + `PATCH /admin/courses/:id` (per-row publish/unpublish toggle), search + publish-status filter |
| `/admin/enrollments` | `POST`/`DELETE /admin/enroll` — **one course per student at a time**: unenrolled students only appear in the enroll picker; enrolled students are listed under "Current enrollments" with a remove action (pre-fillable via `?studentId=`/`?courseId=`) |
| `/admin/settings` | Read-only admin profile — admins are managed directly in the database, so there's no edit form here |

### Design

The admin area uses the same shell and visual language as the
student/instructor app: the shared `AppShell` (wave sidebar on desktop,
bottom bar with a raised bubble on phones), the `brand-*` palette, and the
same light/dark switch. Only the nav items differ per role — see
`components/layout/navConfig.js`. `AdminUi.jsx` keeps its own exports and
props, but each atom mirrors its counterpart in `components/ui`.

On phones the bottom bar shows four tabs plus **More**. Tabs are the items
flagged `primary` in `navConfig.js`; everything else (and theme + log out)
lives in the More sheet, so every route stays reachable on both breakpoints.

### Backend — already robust, verified rather than rewritten

Inspected `inspirare-backend/src` before touching anything:

- `middleware/auth.js`: `requireAuth` validates the Bearer token against
  Supabase Auth; `requireRole('admin')` re-checks the caller's role from
  the `profiles` table (via the service-role client, bypassing RLS) on
  every call — a role can't be spoofed by editing a JWT claim client-side.
- `routes/adminRoutes.js`: `router.use(requireAuth, requireRole('admin'))`
  covers all admin endpoints in one line.
- `controllers/authController.js`: `register()` explicitly rejects any
  `role` other than `student`/`instructor` with a 400 — there's no way to
  self-register as admin even by editing the request body. Admin-created
  accounts (including admins) go through the new
  `POST /api/admin/register` endpoint.
- `GET /api/dashboard` already branches on `role === 'admin'` server-side
  and returns a real aggregate (`total_students`, `total_instructors`,
  `total_courses`, `total_enrollments`) — this wasn't mentioned in the
  brief's endpoint list, but it's what `AdminDashboard.jsx` uses instead
  of summing two separate list calls.
- One course per student is enforced server-side in both
  `POST /api/admin/enroll` and `POST /api/courses/:id/enroll`, and
  `GET /api/admin/enrollments` backs the "mark as enrolled" + picker
  filtering in the admin UI (`database/migration_one_course_per_student.sql`
  hardens this with a unique index once existing data is clean).

## Known API limitations (discovered while building)

- **No per-lesson completion status** is returned by `GET /courses/:id` —
  only lesson metadata. The course page can mark a lesson complete, but
  can't show which lessons were *already* completed in a previous session
  without a dashboard round trip. `CourseDetail.jsx` documents this.
- **No "list my assignments" endpoint.** `Assignments.jsx` sources its list
  from `GET /dashboard`'s `upcoming_assignments`, which is the only place
  the API surfaces assignment IDs to students.
- **No file upload endpoint** — assignment submission accepts a
  `file_url` string, not a binary upload, so the submission form takes a
  link rather than a file picker.
- **No "linked teachers" or calendar endpoints**, so those reference-image
  dashboard widgets were intentionally left out rather than filled with
  fake data.
- **No published/unpublished aggregate for admins** — `GET /dashboard`'s
  admin branch gives totals but not the publish-state split, so
  `AdminDashboard.jsx` derives that (and "recent courses") from
  `GET /admin/courses` instead, per the brief's fallback instruction.

## Remaining work

- Instructor authoring UI (create/edit course, add modules/lessons/
  assignments, grade submissions) is not built — admins create and publish
  courses for now.
- No automated tests.
- `npm run build` has not been run in the environment this project was
  built in (no outbound network access there, so `node_modules` was never
  installed) — run it yourself after `npm install` to confirm before
  shipping.

## Manual test checklist

**Core app**
1. On `/login`, confirm there is no "create an account" link.
2. Refresh the page — session should restore without a login flash.
3. Log out, confirm `/dashboard` redirects to `/login`.
4. Log back in with wrong password — see "Invalid email or password."
5. Browse `/courses`, enroll in a published course, confirm the card
   flips to "Enrolled" (enroll twice — should stay enrolled, no error
   surfaced, per the 409 handling).
6. Open a course, mark a lesson complete, confirm the checkmark appears
   without a page reload.
7. Submit an assignment with just a file link, then just text, then both.

**Admin**
8. Log in as admin — confirm redirect straight to `/admin`, not
   `/dashboard`.
9. While logged in as that admin, manually navigate to `/dashboard` —
   confirm you're bounced back to `/admin`.
10. Log in as a student or instructor and manually navigate to `/admin` —
    confirm you land on `/unauthorized`, with a working "back to your
    dashboard" button, not a blank page or a 500.
11. Admin dashboard — "Register an individual": create a student, confirm
    the printed email/password match what's shown, then log in as that
    student with those credentials.
12. `/admin/users` — change a student's role to instructor, confirm the
    badge updates and the change survives a refresh; try to demote
    yourself, confirm the backend rejects it.
13. `/admin/students` — confirm each student shows either the course they're
    enrolled in or "Not enrolled".
14. `/admin/courses` — create a course (pick an instructor), confirm it
    appears as "Unpublished"; toggle Publish/Unpublish and confirm the
    badge changes.
15. `/admin/enrollments` — an already-enrolled student should NOT appear in
    the student picker; enroll an unenrolled student, confirm they move to
    "Current enrollments" and disappear from the picker; try enrolling a
    second course for that same student directly via the API — confirm the
    409.
16. Remove an enrollment from "Current enrollments", confirm the student
    reappears in the enroll picker.
17. Log out from `/admin`, confirm it behaves the same as the
    student/instructor logout.
