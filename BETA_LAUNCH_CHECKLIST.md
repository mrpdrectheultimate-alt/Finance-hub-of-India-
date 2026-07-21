# FinanceHub - Beta Launch Checklist

Complete every item before inviting beta users.

## Technical

### Database

- [ ] `supabase_schema_safe.sql` runs without errors.
- [ ] `seed_lessons.sql` adds 10+ lessons successfully.
- [ ] All 4 tracks are visible in the Supabase dashboard.
- [ ] RLS policies are verified by testing as a non-admin user.
- [ ] Profiles are auto-created on signup. Check the trigger.

### Auth

- [ ] Email signup works.
- [ ] Confirmation email arrives within 2 minutes.
- [ ] Google OAuth login works.
- [ ] Password reset email works.
- [ ] Middleware blocks `/dashboard` for unauthenticated users.
- [ ] Middleware blocks `/admin` for non-admin emails.

### Core Learning Flow

- [ ] Explore page loads all 4 tracks with levels.
- [ ] Level page shows all lessons with the correct state.
- [ ] Lesson player renders MDX content correctly.
- [ ] Video embed works. Test with a YouTube URL.
- [ ] Mark as complete awards 25 XP.
- [ ] XP celebration popup appears.
- [ ] Quiz modal opens after lesson completion.
- [ ] Quiz scoring and XP award works.
- [ ] Next lesson unlock works after completion.
- [ ] Premium gate shows for free users on Pro lessons.

### AI Tutor

- [ ] AI doubt box opens in the lesson page.
- [ ] AI responds with finance-relevant answers.
- [ ] Free limit of 5 questions per day is enforced correctly.
- [ ] Upgrade prompt shows when the free limit is hit.
- [ ] Standalone `/ai-tutor` page works with persona selector.

### Gamification

- [ ] XP total updates on lesson completion.
- [ ] Streak increments on daily login.
- [ ] Badges are awarded correctly. Test the `first-step` badge.
- [ ] Leaderboard shows users ranked by XP.
- [ ] Profile page shows XP level bar and badges.

### Payments

- [ ] `/pricing` page renders all 3 plans.
- [ ] Stripe test checkout completes with card `4242 4242 4242 4242`.
- [ ] Webhook updates `profile.role` to `pro`.
- [ ] Pro lessons unlock after upgrade.
- [ ] Customer portal is accessible from profile.

### Admin

- [ ] `/admin` redirects non-admin users to `/dashboard`.
- [ ] Lesson list, edit, create, and publish all work.
- [ ] Quiz builder creates quizzes with questions.
- [ ] Users page shows all users with correct data.
- [ ] Role change in admin updates user immediately.
- [ ] Email sending works from the user detail panel.

### Performance

- [ ] Lighthouse mobile score is above 80.
- [ ] First page load is under 3 seconds on mobile.
- [ ] No console errors in production build.
- [ ] Images use `next/image` optimization.

### Mobile

- [ ] Landing page looks good on iPhone 14 width, around 390px.
- [ ] Lesson player is readable on mobile.
- [ ] AI chat is usable with the mobile keyboard.
- [ ] Dashboard navigation works on mobile.

## Content

- [ ] Minimum 10 published lessons. Use `seed_lessons.sql`.
- [ ] At least 3 lessons per track.
- [ ] Every lesson has a quiz with 3+ questions.
- [ ] At least 5 free lessons. Do not put everything behind the paywall.
- [ ] Finance disclaimer is visible on every lesson page.
- [ ] No lorem ipsum or placeholder text is visible to users.

## Legal And Safety

- [ ] Privacy Policy page exists at `/privacy`.
- [ ] Terms of Service page exists at `/terms`.
- [ ] Finance disclaimer is present: "Educational only, not financial advice."
- [ ] AI disclaimer appears in every AI response.
- [ ] GDPR: basic cookie consent. This can be added after launch if needed.

## Marketing Prep

### Product Hunt

Tagline:

```text
World-class finance education - from school to startup founder
```

Description:

```text
Learn personal finance, trading, crypto, and corporate finance through lessons, games, and an AI tutor. Free to start.
```

Link:

```text
https://financehub.in
```

### LinkedIn Post

```text
I built FinanceHub - a free finance education platform with:

- Personal finance: budgeting, saving, investing
- Trading and markets: from zero to strategy
- Crypto and DeFi fundamentals
- Corporate finance for founders
- AI tutor for doubt clearing
- XP, streaks, and badges to keep you going

Why? Because nobody teaches money in school.

Link in bio - completely free to start.
```

### Reddit Posts

- `r/personalfinance`: I built a free finance education platform - feedback welcome
- `r/IndiaInvestments`: Free finance hub for Indian learners - from SIPs to cap tables
- `r/startups`: Built a finance education platform with AI tutor in 8 weeks

### Twitter/X Thread

```text
Tweet 1: Finance education is broken. Nobody teaches money in school.
Tweet 2: So I built FinanceHub - world-class finance education for everyone.
Tweet 3: From your first savings account to running a fundraising round.
Tweet 4: Free to start. Link:
```

## Beta User Targets

Recruit 20 to 50 users across these personas:

- 5 school or college students.
- 10 working professionals.
- 5 traders or active investors.
- 5 founders or aspiring entrepreneurs.
- 5 exam aspirants, such as CFA, FRM, or CA students.

Collect feedback via:

- WhatsApp or Telegram group for beta users.
- Typeform survey after 7 days.
- PostHog session recordings.
- Direct 1:1 calls with 5 power users.

## Success Metrics For Beta

After 30 days, aim for:

- [ ] 200+ sign-ups.
- [ ] 40%+ day-7 retention.
- [ ] 50+ lessons completed.
- [ ] 10+ AI tutor questions asked.
- [ ] 5+ Pro upgrades.
- [ ] NPS score of 40+ from survey.

If these are met, open public launch.

If not, interview users, find the drop-off, and fix it first.
