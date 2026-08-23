# EUROHULL Careers App — Smoke Test Checklist

## Public Flow
- [ ] Landing page loads with hero, dust particles, spotlight beams
- [ ] Job cards display with rivets, hover sparks, correct department colors
- [ ] Click job card → navigates to detail page
- [ ] Job detail: description, requirements, "Apply now" button
- [ ] Click "Apply now" → modal opens with steel frame
- [ ] Fill form (name, email, phone, message)
- [ ] Upload PDF → file shows with size, verifying message
- [ ] Upload >10MB → error message
- [ ] Upload non-PDF/DOCX → error message
- [ ] Submit → upload progress → virus scan animation → success screen
- [ ] Success: anchor icon, "Application received", confirmation email sent
- [ ] Check email inbox for cinematic HTML confirmation email

## Admin Flow
- [ ] Navigate to /admin → password gate with grid background
- [ ] Enter wrong password → error toast
- [ ] Enter correct password → dashboard loads
- [ ] Dashboard: 3 stat cards, real-time toast on new application
- [ ] Jobs tab: table with status badges, edit button
- [ ] Click "New position" → job editor modal opens
- [ ] Fill job form, set status to "active", enable auto-post
- [ ] Save → social post toast appears (LinkedIn / Facebook / Instagram)
- [ ] Check social_posts table for logged entries
- [ ] Applications tab: filter by scan status, search by name
- [ ] Click application → detail modal with download/rescan
- [ ] Download CV (only if clean) → file downloads
- [ ] Rescan file → status updates
- [ ] Settings tab: update email template, test scan, preview email
- [ ] Test social connection → green/red dot updates
- [ ] Logout → returns to password gate

## Security
- [ ] Upload renamed .exe as .pdf → magic bytes rejection
- [ ] Upload file with "virus" in name → quarantined
- [ ] Submit 4 applications with same email in 1 day → rate limit error
- [ ] Try to access admin without login → password gate
- [ ] Try to download infected file → button disabled

## Responsive
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1440px width)
- [ ] All tap targets >= 44px
- [ ] No horizontal scroll on mobile (except admin tables)

## Accessibility
- [ ] Skip to main content link appears on first Tab press
- [ ] Every interactive element shows a red focus ring
- [ ] ESC closes the apply modal; focus returns to the trigger
- [ ] Admin table rows open with Enter / Space
- [ ] prefers-reduced-motion disables dust, beams and sparks

## Performance
- [ ] Lighthouse score > 90 on mobile
- [ ] First Contentful Paint < 1.5s
- [ ] No layout shift during load
- [ ] Animations pause when the tab is hidden
