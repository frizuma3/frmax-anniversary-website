# 15 Years Priestly Anniversary Website

A beautiful Node.js + SQLite website where well-wishers can submit felicitations and RSVP attendance responses. The celebrant can view everything from an admin page.

## New features added

- RSVP attendance form
- Transport help removed
- Dietary needs removed
- Parish/church map for IV4 7AU
- Live countdown to the anniversary day
- Animated Bible verses
- Background Gregorian chant/music button
- Admin dashboard for both felicitations and RSVP responses

## How to run in VS Code

1. Install Node.js from https://nodejs.org
2. Open this folder in VS Code.
3. Open the terminal and run:

```bash
npm install
```

4. Start the website:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

Admin page:

```text
http://localhost:3000/admin.html
```

## Admin password

Set your admin password in the `.env` file:

```text
ADMIN_PASSWORD=your-secure-password-here
```

## Changing the countdown date

Open:

```text
public/app.js
```

Change this line near the top:

```js
const ANNIVERSARY_DATE = '2026-09-19T12:00:00+01:00';
```

Use your exact anniversary date and time.

## Gregorian chant music

Place your chant MP3 file here:

```text
public/audio/gregorian-chant.mp3
```

Keep the file name exactly as `gregorian-chant.mp3`, or edit the path in `public/index.html`.

## Images

Replace these files with your own images:

- `public/images/church.jpg` for the top background
- `public/images/FrMax1.jpeg` for the priestly image section

## Where data is stored

Messages and RSVP responses are saved in `messages.db`, an SQLite database.
