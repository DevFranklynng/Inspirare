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
    auth/            AuthLayout, LoginForm, RegisterForm, AuthGuard,
                      BlockAdminFromAppArea
    layout/          AppLayout, Sidebar, Topbar (student/instructor)
    dashboard/       WelcomeCard, ProgressCard, UpcomingAssignments,
                      PerformanceCard, InstructorSummary
    courses/         CourseCard, ModuleAccordion
    assignments/     AssignmentCard
    ui/              Button, Input, Card, Progress, Avatar, LoadingState,
                      EmptyState, ErrorState, SectionErrorBoundary
  layouts/           AdminLayout.jsx — dedicated admin shell
  features/admin/
    components/      AdminSidebar, AdminHeader, AdminUi.jsx (StatCard,
                      StatusBadge, SearchInput, AdminSelect,
                      LoadingState/EmptyState/ErrorState, ConfirmDialog,
                      AdminButton), DataTable.jsx
  pages/             Login, Register, RoleHome, Dashboard, Courses,
                      CourseDetail, Assignments, Settings, Placeholder,
                      Unauthorized, NotFound
  pages/admin/       AdminDashboard, AdminStudents, AdminCourses,
                      AdminEnrollments, AdminSettings
```

## Auth flow

1. `/login` or `/register` calls the API, stores `access_token` /
   `refresh_token` in `localStorage`.
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

### Creating an admin (no public registration exists for this — by design)

1. Register a normal account through the existing `POST /auth/register`
   endpoint (Postman, or the app's own sign-up form) — it'll be created as
   a `student` or `instructor`.
2. Find that user's id (Supabase Table Editor → `profiles`, or
   Authentication → Users).
3. Promote it directly in the database:
   ```sql
   update public.profiles set role = 'admin' where id = '<user-uuid>';
   ```
   (`inspirare-backend/database/migration_admin_and_profile_cleanup.sql`
   already adds `admin` to the role enum — no new migration needed.)
4. Log in with that account's email/password on the normal `/login` page.
   The frontend reads `profile.role === "admin"` from `/auth/me` and sends
   you to `/admin`.

There is no `AdminRegister` page, no `/admin/register` route, and no public
admin-creation endpoint anywhere in this frontend.

### Routes

| Route | Page |
|---|---|
| `/admin` | Platform overview: total students/instructors/courses/enrollments (real `GET /dashboard` aggregate for an admin), published/unpublished split + recent courses (derived from `GET /admin/courses`), quick actions |
| `/admin/students` | `GET /admin/students` — search, per-row "Enroll" action |
| `/admin/courses` | `GET /admin/courses` — search + publish-status filter, per-row "Enroll student" action |
| `/admin/enrollments` | `POST`/`DELETE /admin/enroll` — student + course pickers (pre-fillable via `?studentId=`/`?courseId=` from the row actions above), confirm dialog before removing an enrollment |
| `/admin/settings` | Read-only admin profile — admins are managed directly in the database, so there's no edit form here |

### Design

Deliberately its own visual identity — near-black surfaces
(`ink-*` in `tailwind.config.js`) with a restrained gold accent
(`gold-*`) used only for the active nav item, primary buttons, and status
highlights — kept separate from the blue `brand-*` palette the rest of
the app uses, so the two areas don't bleed into each other.

### Backend — already robust, verified rather than rewritten

Inspected `inspirare-backend/src` before touching anything:

- `middleware/auth.js`: `requireAuth` validates the Bearer token against
  Supabase Auth; `requireRole('admin')` re-checks the caller's role from
  the `profiles` table (via the service-role client, bypassing RLS) on
  every call — a role can't be spoofed by editing a JWT claim client-side.
- `routes/adminRoutes.js`: `router.use(requireAuth, requireRole('admin'))`
  covers all four admin endpoints in one line.
- `controllers/authController.js`: `register()` explicitly rejects any
  `role` other than `student`/`instructor` with a 400 — there's no way to
  self-register as admin even by editing the request body.
- `GET /api/dashboard` already branches on `role === 'admin'` server-side
  and returns a real aggregate (`total_students`, `total_instructors`,
  `total_courses`, `total_enrollments`) — this wasn't mentioned in the
  brief's endpoint list, but it's what `AdminDashboard.jsx` uses instead
  of summing two separate list calls.

**No backend or database changes were made** — everything above already
matched the brief's security requirements.

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
  assignments, grade submissions) is not built.
- No automated tests.
- `npm run build` has not been run in the environment this project was
  built in (no outbound network access there, so `node_modules` was never
  installed) — run it yourself after `npm install` to confirm before
  shipping.

## Manual test checklist

**Core app**
1. Register a new student, confirm redirect to `/dashboard`.
2. Refresh the page — session should restore without a login flash.
3. Log out, confirm `/dashboard` redirects to `/login`.
4. Log back in with wrong password — see "Invalid email or password."
5. Browse `/courses`, enroll in a published course, confirm the card
   flips to "Enrolled" (enroll twice — should stay enrolled, no error
   surfaced, per the 409 handling).
6. Open a course, mark a lesson complete, confirm the checkmark appears
   without a page reload.
7. Submit an assignment with just a file link, then just text, then both.
8. Register a second account with role `instructor` (manual API call,
   since sign-up UI defaults to student) and confirm the dashboard
   switches to the instructor summary view.

**Admin**
9. Promote an existing account to `admin` in the database (see above),
   log in — confirm redirect straight to `/admin`, not `/dashboard`.
10. While logged in as that admin, manually navigate to `/dashboard` —
    confirm you're bounced back to `/admin`.
11. Log in as a student or instructor and manually navigate to `/admin` —
    confirm you land on `/unauthorized`, with a working "back to your
    dashboard" button, not a blank page or a 500.
12. `/admin/students` — confirm the list matches real registered students,
    search filters correctly, empty state shows if there are none.
13. `/admin/courses` — confirm every course shows regardless of publish
    state, the publish filter and search both work.
14. `/admin/enrollments` — enroll a student in a course, confirm success;
    try the same pair again, confirm the 409 message; remove the
    enrollment via the confirm dialog, confirm success.
15. Click "Enroll" from a row on `/admin/students`, confirm the
    enrollments page opens with that student pre-selected (same for a
    course row on `/admin/courses`).
16. Log out from `/admin`, confirm it behaves the same as the
    student/instructor logout.
