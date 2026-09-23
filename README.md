# Inspirare Frontend

React + Vite + Tailwind frontend for Inspirare, connected to the live
Inspirare API at `https://inspirare-api.vercel.app/api`.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

`npm install` was **not** run in the environment this project was generated
in (no outbound network access there), so do this first on your own
machine before anything else — the app won't build until `node_modules`
exists.

## Structure

```
src/
  api/            client.js (fetch wrapper, auth header, error shaping)
                  auth.js, dashboard.js, courses.js, lessons.js, assignments.js
  context/        AuthContext.jsx — session restore, login/register/logout
  components/
    auth/         AuthLayout, LoginForm, RegisterForm, AuthGuard
    layout/       AppLayout, Sidebar, Topbar
    dashboard/    WelcomeCard, ProgressCard, UpcomingAssignments, PerformanceCard, InstructorSummary
    courses/      CourseCard, ModuleAccordion
    assignments/  AssignmentCard
    ui/           Button, Input, Card, Progress, Avatar, LoadingState, EmptyState, ErrorState, SectionErrorBoundary
  pages/          Login, Register, Dashboard, Courses, CourseDetail, Assignments, Settings, Placeholder, NotFound
```

## Auth flow

1. `/login` or `/register` calls the API, stores `access_token` /
   `refresh_token` in `localStorage`.
2. `AuthContext` then calls `GET /auth/me` and uses that profile (never a
   frontend guess) as the source of truth for name/role/avatar/department/
   level/institution.
3. On every page load, `AuthContext` re-validates the stored token against
   `/auth/me` before treating the user as signed in.
4. A `401` from any request clears the session and routes to `/login`
   automatically (see `registerUnauthorizedHandler` in `api/client.js`).
5. `RequireAuth` protects `/dashboard`, `/courses`, `/assignments`, etc.;
   `RedirectIfAuthenticated` keeps signed-in users off `/login` /
   `/register`.

## Known backend limitations (discovered while building)

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
  fake data (see design brief §21, "real API data > mock data").

## Remaining work

- Instructor authoring UI (create/edit course, add modules/lessons/
  assignments, grade submissions) is not built — the dashboard reads
  instructor data, but the create/PATCH/grade endpoints aren't wired to
  any form yet.
- No automated tests.
- Not yet run against the live API in this environment (no outbound
  network access here) — run through the manual test list below after
  `npm install`.

## Manual test checklist

1. Register a new student, confirm redirect to `/dashboard`.
2. Refresh the page — session should restore without a login flash.
3. Log out, confirm `/dashboard` redirects to `/login`.
4. Log back in with wrong password — see "Invalid email or password."
5. Browse `/courses`, enroll in a published course, confirm the card
   flips to "Enrolled" (test enrolling twice — should stay enrolled, no
   error surfaced, per the 409 handling).
6. Open a course, mark a lesson complete, confirm the checkmark appears
   without a page reload.
7. Submit an assignment from `/assignments` with just a file link, then
   just text, then both.
8. Register a second account with role `instructor` (via a manual API
   call, since sign-up UI defaults to student) and confirm the dashboard
   switches to the instructor summary view.
