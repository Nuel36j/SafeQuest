# SafeQuest API

Anonymous, crowdsourced reports of scam phone numbers, bank accounts and links.
Anyone can search an identifier for free. Reporting needs an account, and accounts
are anonymous: a generated handle and a password, nothing else.

## Structure

```
backend/
├── core/
│   ├── config.py        # Settings, loaded from .env
│   ├── database.py      # SQLAlchemy engine/session
│   ├── security.py      # Password hashing + JWT helpers
│   ├── permissions.py   # get_current_user, require_user, require_admin
│   ├── normalizer.py    # phone / account / URL -> one canonical form
│   ├── scoring.py       # risk score + level (all thresholds are constants)
│   └── rate_limit.py    # in-memory per-IP limiter
├── crud/                # audit_log.py, identifier.py, report.py, user.py
├── models/              # audit_log.py, identifier.py, report.py, user.py
├── routers/
│   ├── auth.py          # POST /auth/register, /auth/login
│   ├── user.py          # GET/PATCH /users/me
│   ├── reports.py       # POST /reports
│   ├── search.py        # GET /search
│   └── admin.py         # review queue, ban/unban, audit log
├── schemas/             # audit_log.py, identifier.py, report.py, user.py
├── main.py              # App factory / entrypoint
├── make_admin.py        # promote an account to admin
└── requirements.txt
```

## Setup

From the project root (the folder that **contains** this `backend/` folder):

```bash
python -m venv venv
source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
```

Edit `backend/.env`. With `DEBUG=false` the app refuses to start until `SECRET_KEY` is changed.

## Run

```bash
uvicorn backend.main:app --reload
```

Docs: `http://127.0.0.1:8000/docs`

## First admin

1. `POST /api/v1/auth/register` with `{"password": "..."}`. Save the `handle` in the response.
2. From the project root: `python -m backend.make_admin <handle>`
3. Log in at `/api/v1/auth/login` (form field `username` is the handle).

## How it works

**Search** `GET /api/v1/search?type=phone|account|url&q=...&bank=...`
Public, rate limited. Returns risk level (`unknown`, `caution`, `high_risk`), approved report count,
scam types and the most recent report date. Never report text or reporters.
`unknown` means no evidence yet, not that the identifier is safe.
`bank` is required for `account` (the same digits exist at different banks).

**Report** `POST /api/v1/reports` (login required)
One report per user per identifier. Reports from users below `AUTO_APPROVE_MIN_REPUTATION`
wait in the admin queue. Admin approvals raise the reporter's reputation, rejections lower it.

**Scoring** (`core/scoring.py`)
Each approved report weighs 0.25 (new account) up to 1.0 (reputation 10+), and halves every
180 days for phones, 365 for accounts, 90 for URLs. `caution` at 0.5 total weight.
`high_risk` needs 2.0 total weight AND at least 3 different reporters.

**Anonymity**
No email, phone or name is collected. IPs are used for rate limiting only, in memory, never stored.
A lost handle or password cannot be recovered.

## Not built yet

- Screenshot evidence (needs EXIF stripping before storing)
- Captcha / proof-of-work on registration
- Appeals for people who think an identifier was flagged wrongly
- Alembic migrations (tables are created on startup for now)
- Redis-backed rate limiting if you run more than one worker
