# Graduation Project Hub — Fullstack (v2.0)

A complete Node.js/Express + MongoDB backend and React frontend for a graduation
project management system with **students** and **supervisors**.

## What's fixed in v2.0
- **Supervisors are independent** — they do NOT belong to a team. They have their own dashboard for handling supervision requests.
- **Dedicated supervision workflow**: team leader sends a request → supervisor accepts/rejects → team sees status.
- **Edit projects**: team leader can edit title, description, skills, max members.
- **Member management**: team leader can remove members; members can leave; leader cannot be removed.
- **Strict role validation** on the server: students cannot be requested as supervisors; supervisors cannot create/join teams; login checks the selected role against the account's actual role.
- **Supervisor Dashboard** with pending requests, supervised projects, and history tabs.
- **Notifications** with a clean dropdown, unread badge, per-type icons, read/mark-all-read — for: join request, join accepted/rejected, supervision request/accepted/rejected, project updated, member removed.

## Run locally

### 1. MongoDB
Run a local MongoDB (default port 27017) or use Atlas.

### 2. Backend
```bash
cd backend
cp .env.example .env       # edit MONGODB_URI and JWT_SECRET if needed
npm install
npm run seed               # creates demo accounts (see output)
npm run dev                # starts on http://localhost:5000
```

Seeded accounts:
- Students:  `alice@uni.edu`, `bob@uni.edu`, `carol@uni.edu`, `dave@uni.edu`  (password: `password`)
- Supervisors: `smith@uni.edu`, `jones@uni.edu`  (password: `password`)
- Alice already owns the project "Smart Campus Navigator".

### 3. Frontend
```bash
cd frontend
cp .env.example .env       # REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start                  # opens http://localhost:3000
```

## API reference

### Auth `/api/auth`
- `POST /register` `{ fullName, email, password, role: 'student'|'supervisor', department? }`
- `POST /login` `{ email, password, role? }` — if `role` is sent, must match the account
- `GET  /me` · `PATCH /me` · `POST /change-password`

### Projects `/api/projects`
- `GET /`  search projects
- `GET /mine` your team's project (or null)
- `GET /:id` one project
- `POST /` **student** create
- `PATCH /:id` **leader** edit (title, description, skills, maxMembers, status)
- `DELETE /:id` **leader** delete

### Teams `/api/teams`
- `POST /:projectId/join` **student** request to join
- `DELETE /:projectId/join` cancel my pending request
- `GET /:projectId/requests` **leader** list join requests
- `POST /requests/:requestId/respond` `{ decision: 'accept'|'reject' }` **leader**
- `DELETE /:projectId/members/:userId` **leader** remove a member
- `POST /:projectId/leave` leave team

### Supervisors `/api/supervisors`
- `GET /` list supervisors
- `POST /requests` `{ projectId, supervisorId, message? }` **leader (student)**
- `GET /me/requests` **supervisor** list my supervision requests
- `POST /requests/:requestId/respond` `{ decision }` **supervisor**
- `GET /me/projects` **supervisor** my supervised projects

### Messages `/api/messages`
- `GET /project/:projectId` · `POST /project/:projectId` `{ body }`
  (Access: members + accepted supervisor)

### Files `/api/files` (multipart via Multer)
- `GET /project/:projectId`
- `POST /project/:projectId` (`file`, `folder`)
- `DELETE /:id`

### Notifications `/api/notifications`
- `GET /` · `PATCH /:id/read` · `POST /read-all`

## Tested
The backend has been smoke-tested end-to-end (35 assertions covering auth, role
checks, project editing, join/leave, member removal, supervisor request/accept/
reject, messaging access, notifications, file upload).
