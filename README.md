# MaryWebAppCampus

MaryWebAppCampus is a full-stack web application for handling university maintenance complaints and service requests. It replaces manual reporting through phone calls, paper forms, WhatsApp messages, and office visits with a web platform for request submission, assignment, tracking, reporting, and accountability.

## What This Project Does

- Students and staff can register, log in, submit service requests, and track progress.
- Maintenance officers can view assigned work, update job status, and mark work as completed.
- Administrators can manage users, view all requests, assign jobs to officers, monitor status, and export reports.
- The backend exposes a Django REST API with JWT authentication.
- The database is Supabase Postgres.
- The frontend is a React Material UI app branded as `MaryWebAppCampus`.

## Main Features

- User registration and login.
- Email-or-username authentication.
- Role-based access for `admin`, `officer`, `student`, and `staff`.
- Role-based dashboards.
- Service request form with category, priority, building, and room fields.
- Request list with search, filtering, and pagination.
- Admin request management.
- Officer assignment workflow.
- Status update history/audit trail.
- CSV and PDF export.
- Swagger API documentation.
- Keep-alive endpoint for scheduled pings.
- Powder-blue page background, purple/lilac branding, rainbow cards, and charcoal sidebar capsules.

## Tech Stack

### Frontend

- React 18
- Material UI
- Axios
- React Router
- Notistack

### Backend

- Django 4.2
- Django REST Framework
- Simple JWT
- drf-spectacular Swagger docs
- django-filter
- ReportLab for PDF export
- Supabase Postgres through `DATABASE_URL`
- WhiteNoise for static files

## Project Structure

```text
MaryWebAppCampus/
  backend/
    apps/
      accounts/
      assignments/
      notifications/
      requests/
    maintenance_api/
    create_admin.py
    create_tables.py
    manage.py
    requirements.txt
    vercel.json
  frontend/
    src/
      components/
      contexts/
      pages/
      services/
    package.json
    vercel.json
  .github/
    workflows/
      keep-alive.yml
```

## Important Local Environment Note

Use the working backend virtual environment:

```text
backend/venv
```

The old `venv_final` folder was removed because it contained broken paths from another Windows user. Do not recreate or use `venv_final`.

## Local Backend Setup

From the project root:

```powershell
cd backend
py -3 -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

Create `backend/.env`:

```env
DEBUG=True
DJANGO_SECRET_KEY=local-dev-maintenance-system-secret-key-change-before-deploy
ALLOWED_HOSTS=localhost,127.0.0.1,.vercel.app
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
DATABASE_URL=your_supabase_transaction_pooler_url
```

If your Supabase password contains `@`, encode it as `%40` inside `DATABASE_URL`.

Run migrations:

```powershell
.\venv\Scripts\python.exe manage.py migrate
```

Create or update the admin user:

```powershell
$env:DJANGO_SUPERUSER_PASSWORD="Admin12345!"
.\venv\Scripts\python.exe create_admin.py
```

Default admin details:

```text
username: admin
email: admin@mary.com
password: Admin123@
```

Start the backend:

```powershell
.\venv\Scripts\python.exe manage.py runserver
```

Backend runs at:

```text
http://localhost:8000
```

The root URL may show `404`; that is normal. Use the API URLs below.

## Local Frontend Setup

Open a second PowerShell window:

```powershell
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Start the frontend:

```powershell
npm start
```

Frontend runs at:

```text
http://localhost:3000
```

## Supabase Setup

1. Create a Supabase project.
2. Go to **Project Settings > Database**.
3. Use the **Transaction pooler** connection string, not the direct IPv6 connection.
4. The URL should look like this:

```text
postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

5. Put that full URL into `backend/.env` as `DATABASE_URL`.
6. Run:

```powershell
cd backend
.\venv\Scripts\python.exe manage.py migrate
```

The migrations seed:

- Roles: `admin`, `officer`, `student`, `staff`
- Categories: Electricity, Plumbing, Furniture, Internet, Classroom Equipment, Hostel Maintenance, Cleaning, HVAC, Building

## API Names And Endpoints

Swagger title:

```text
MaryWebCampusAPI
```

Useful endpoints:

```text
GET  /api/keep-alive/
GET  /api/swagger/
GET  /api/schema/
POST /api/token/
POST /api/token/refresh/
GET  /api/auth/users/me/
POST /api/auth/register/
GET  /api/requests/
GET  /api/requests/categories/
GET  /api/requests/export_csv/
GET  /api/requests/export_pdf/
GET  /api/MaryWebAppAPI/
GET  /api/MaryWebAppAPI/my_assignments/
GET  /api/notifications/
```

The assignments API path was renamed from the old duplicated path to:

```text
/api/MaryWebAppAPI/
```

## GitHub Keep-Alive Workflow

The workflow is here:

```text
.github/workflows/keep-alive.yml
```

It no longer contains another person’s Hugging Face URL. It uses a GitHub secret:

```text
KEEP_ALIVE_URL
```

Set that secret to your deployed backend keep-alive URL:

```text
https://your-backend-domain.vercel.app/api/keep-alive/
```

## Deploying To Vercel

Deploy the frontend and backend as two Vercel projects under the same Vercel organization.

Example:

```text
marywebappcampus-frontend
marywebappcampus-backend
```

They will still have separate domains:

```text
https://marywebappcampus-frontend.vercel.app
https://marywebappcampus-backend.vercel.app
```

### Backend Vercel Project

Root directory:

```text
backend
```

Environment variables:

```env
DEBUG=False
DJANGO_SECRET_KEY=use-a-long-random-secret
ALLOWED_HOSTS=.vercel.app,marywebappcampus-backend.vercel.app
CORS_ALLOWED_ORIGINS=https://marywebappcampus-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://marywebappcampus-frontend.vercel.app
DATABASE_URL=your_supabase_transaction_pooler_url
DJANGO_SUPERUSER_PASSWORD=your_admin_password
```

After deployment, run migrations locally using the production `DATABASE_URL`:

```powershell
cd backend
$env:DEBUG="False"
$env:DATABASE_URL="your_supabase_transaction_pooler_url"
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe create_admin.py
```

Backend API base URL:

```text
https://marywebappcampus-backend.vercel.app/api
```

### Frontend Vercel Project

Root directory:

```text
frontend
```

Environment variable:

```env
REACT_APP_API_URL=https://marywebappcampus-backend.vercel.app/api
```

Build settings:

```text
Framework Preset: Create React App
Build Command: npm run build
Output Directory: build
```

## Verification Commands

Backend:

```powershell
cd backend
.\venv\Scripts\python.exe manage.py check
```

Frontend:

```powershell
cd frontend
npm run build
```

Both commands were used during development to verify the app after changes.
