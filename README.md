# Invoicely

Invoicely is a modern, full-stack invoicing application designed for seamless invoice generation, client management, and multi-currency pricing. 

## 🚀 Technologies Used

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [Auth0](https://auth0.com/) (with Google Social Login support)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Key Client Libraries**: 
  - `react-phone-number-input` for standardized phone inputs.
  - `react-signature-canvas` for digital signatures on invoices.
  - `dayjs` for robust date formatting.
  - `qrcode.react` for QR codes.

## 🛠️ First-Time Setup & Installation

Follow these steps to run the project locally for the first time.

### 1. Clone the repository and install dependencies
```bash
# Install dependencies using npm (or pnpm, yarn)
npm install
```

### 2. Configure Environment Variables
Copy the provided example environment variables file:
```bash
cp .env.example .env.local
```
Fill in `.env.local` with your own Supabase and Auth0 credentials (see configuration details below).

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 🔒 Configuration Guides

### Configuring Auth0 & Google Auth

1. **Create an Auth0 Account**: Sign up at [Auth0](https://auth0.com/).
2. **Create an Application**: Go to **Dashboard > Applications > Create Application** (Select "Regular Web Applications").
3. **Configure URIs** in your application settings:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000/`
4. **Enable Google Social Connection**:
   - Go to **Authentication > Social > Create Connection > Select Google Workspace**.
   - You can use Auth0's provided Google keys for testing, or set up a Google Cloud Console project to get your own Google Client ID and Secret to plug into Auth0.
5. **Update `.env.local`**:
   - Generate a 32-byte hex secret for `AUTH0_SECRET` using `openssl rand -hex 32`.
   - Copy `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, and `AUTH0_CLIENT_SECRET` from your Auth0 Application settings.

### Configuring Supabase

1. **Create a Supabase Project**: Sign up at [Supabase](https://supabase.com/) and create a new project.
2. **Get API Credentials**: Go to **Project Settings > API**.
   - Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy the `anon` `public` key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - Copy the `service_role` secret into `SUPABASE_RPC_SECRET`.
3. **Database Provider Strategy**:
   - By default, `.env.local` might have `NEXT_PUBLIC_DB_PROVIDER=mock` for testing without a database. Change it to `NEXT_PUBLIC_DB_PROVIDER=supabase` to connect to your real remote database.

---

## 🗄️ Database Migrations

This project uses the Supabase CLI to manage database migrations. Migrations are essential for keeping your local environment, staging, and production databases in sync with your schema changes.

### 1. Install Supabase CLI
If you haven't already, install the [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started).
```bash
# On macOS via Homebrew:
brew install supabase/tap/supabase

# On Windows via Scoop:
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Login to Supabase CLI
```bash
supabase login
```

### 3. Link your project
Find your project reference ID in your Supabase dashboard URL (`https://supabase.com/dashboard/project/<project-ref>`).
```bash
supabase link --project-ref <your-project-ref>
```

### 4. Create a New Migration
When you need to make changes to your database schema (e.g., adding a new table or column):
```bash
supabase migration new <name_of_migration>
```
This creates a new SQL file in the `supabase/migrations/` directory. Open the newly created file and write your raw SQL changes there.

### 5. Apply Migrations to Remote Database
To push your local migrations to your remote Supabase database:
```bash
supabase db push
```

*(Note: For local database development, use `supabase start` to spin up a local dockerized Supabase instance, and `supabase db reset` to apply migrations locally. Once tested locally, you can push to the remote environment).*
