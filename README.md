# Hull Careers Hub

Build a cinematic careers/job application web app for a shipyard company called EUROHULL.

DESIGN — Cinematic Nautical/Industrial:
- Dark theme: primary bg #0a1628 (ocean deep), cards #1e293b (steel grey), accent #c2410c (rust orange), highlight #d4a853 (gold)
- Glassmorphism cards: backdrop-blur, bg-white/5, border-white/10, subtle glow on hover (gold shadow)
- Typography: Playfair Display for headings (serif, cinematic), Inter for body
- Hero: full viewport with animated gradient or subtle wave effect, company name "EUROHULL" large, tagline "Building the Future of Maritime"
- Loading: custom nautical spinner
- Page transitions: fade + slight slide

PUBLIC PAGES (no login required):
1. Landing Page: hero + scroll to job listings
2. Job Listings: responsive grid of glassmorphism cards. Each card shows: title, department badge (pill), location, employment type (full-time/part-time/contract). Left border colored by department. Hover glow effect.
3. Job Detail: full description, requirements, CTA "Apply Now"
4. Apply Modal (opens on CTA click):
   - Full name (required)
   - Email (required, validated)
   - Phone (optional)
   - Cover message (optional, max 500 chars)
   - File upload zone: drag & drop, dashed border, accepts PDF and DOCX only, max 10MB. Show file name + size after selection. Progress bar during upload.
   - Submit button: rust orange with gold glow on hover
5. Success Screen: cinematic thank you animation, message "We received your application. A confirmation email has been sent."

ADMIN PANEL (/admin, password protected):
- Simple password gate (one admin user)
- Dashboard: 3 stat cards — Total Applications, This Month, Unread
- Job Manager: table of all jobs, create/edit/activate/close. Form fields: title, department, description (rich text), employment type, location, status (draft/active/closed), auto-post to social media toggle.
- Applications: table per job listing. Columns: name, email, phone, date, virus scan status, read/unread, archive. Click to view detail + download CV file.
- Settings: email from address, confirmation email subject/body template (with placeholders {{full_name}}, {{job_title}}), max file size, social media API keys (LinkedIn, Facebook, Instagram)

DATABASE (Supabase):
- job_listings: id, title, department, description, employment_type, location, status (draft/active/closed), social_auto_post (boolean), created_at
- applications: id, job_listing_id (FK), full_name, email, phone, cover_message, file_path, file_name, file_size, file_mime_type, virus_scan_status (pending/clean/infected/error), email_sent (boolean), is_read (boolean), is_archived (boolean), created_at
- app_settings: single row config — max_file_size_mb, email_from, email_subject, email_body_template, virus_scan_enabled, admin_password_hash, social_api_keys
- Storage bucket "cv-uploads" with folders: applications/{job_listing_id}/{application_id}/

FILE UPLOAD & VIRUS SCAN:
- Client validates: PDF/DOCX only, max 10MB
- Upload to Supabase Storage
- After upload, trigger async virus scan (simulate with a 2-second scan animation showing shield icon + "Scanning file..." → "✓ Safe" or "✗ Threat detected")
- If clean: store application, send confirmation email
- If infected: reject, quarantine file, show error to user
- Admin can only download files marked as "clean"

EMAIL:
- Use Resend (or mock for now)
- Send confirmation email to applicant after clean scan
- Template: "Thank you {full_name}, we received your application for {job_title}. We will contact you soon. — EUROHULL Team"

SOCIAL AUTO-POST:
- When a job status changes from draft → active and social_auto_post = true, trigger posts to LinkedIn, Facebook, Instagram
- Post text: "🔧 New position at EUROHULL: {title} — {location}. Apply at {url}"
- For Instagram: generate a simple branded image card with job title + EUROHULL logo, then post

TECH STACK:
- React + TypeScript + Tailwind CSS + shadcn/ui
- Supabase for DB, Auth, Storage
- Responsive: mobile-first, single column on mobile, 2-col tablet, 3-col desktop

Start by building the public landing page, job listings, and apply modal. Then build the admin panel. Use mock data for 3-4 sample job listings initially.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e5ba1a33-cad8-474b-b0c4-686a76902ee6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
