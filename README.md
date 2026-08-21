# Wedding Photo Challenge

A mobile-first wedding game:

**QR code → challenge → camera/upload → cloud storage → live slideshow**

## 1. Create a Supabase project

Create a project at Supabase, then open **SQL Editor** and run:

`supabase/schema.sql`

This creates:
- `challenges`
- `photos`
- a public `wedding-photos` storage bucket
- the guest upload/read policies

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_URL`

Never expose the service-role key in browser code.

## 3. Run

```bash
npm install
npm run dev
```

Open `/admin`.

Enter the admin password, create challenges, and download the QR codes.

## 4. Deploy

This project is designed for a standard Next.js deployment such as Vercel.

Set the same environment variables in the hosting provider.

Important: set `NEXT_PUBLIC_APP_URL` to the final public URL, for example:

`https://photos.yourwedding.com`

The generated QR codes use this URL.

## 5. Wedding-day flow

- Print the downloaded QR codes and place them around the venue.
- Guests scan a code.
- They take a photo and optionally enter their name.
- The photo is uploaded to Supabase.
- `/slideshow` automatically refreshes and rotates through all submitted photos.

For a TV/projector, open `/slideshow` in a browser and use fullscreen mode.

## Security note

The simple admin password is intended for a private wedding event. For a public commercial product, replace it with proper authentication and add moderation/rate limiting.

## Vercel root directory

The Vercel project root must be the folder containing `package.json`, `app/`, and `lib/`.
If GitHub shows the project inside a nested folder, set Vercel's Root Directory to that folder.

