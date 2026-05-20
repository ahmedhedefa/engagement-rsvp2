# Ahmed & Christine RSVP Site

Local RSVP website with an animated invitation reveal, RSVP form, admin dashboard, and JSON-backed response tracking.

## Setup

```bash
npm install
```

## Run

You **must** set an admin key before running, or the admin dashboard will reject all requests.

**PowerShell (Windows):**

```powershell
$env:ADMIN_KEY="pick-something-long-and-random"; node server.js
```

**bash / zsh (Mac, Linux):**

```bash
ADMIN_KEY="pick-something-long-and-random" node server.js
```

Then open:

- **Guest RSVP page:** http://localhost:3000
- **Admin dashboard:** http://localhost:3000/admin (enter the admin key to unlock)

## Deploying to Railway

1. Push this repo to GitHub
2. Create a new project in Railway and point it at the repo
3. In Railway → your service → **Variables**, add `ADMIN_KEY` with a long random value
4. Railway sets `PORT` automatically — don't override it
5. Open the generated URL

## File layout

```
.
├── server.js
├── package.json
├── README.md
├── .gitignore
├── data/
│   └── rsvps.json
└── public/
    ├── index.html
    ├── admin.html
    ├── app.js
    ├── admin.js
    ├── styles.css
    └── images/
        └── invitation_7pm.png
```

Only files inside `public/` are exposed to the web.

## API

| Method | Path             | Auth          | Description                              |
|--------|------------------|---------------|------------------------------------------|
| POST   | `/api/rsvps`     | none          | Submit a new RSVP (rate-limited 10/min)  |
| GET    | `/api/rsvps`     | `x-admin-key` | List all RSVPs and summary counts        |
| DELETE | `/api/rsvps/:id` | `x-admin-key` | Delete a single RSVP                     |
| DELETE | `/api/rsvps`     | `x-admin-key` | Delete all RSVPs                         |
