# Rolling Wheels – Homepage

A website for SV Lohhof Rolling Wheels, built with [Next.js](https://nextjs.org) and Tailwind CSS. It includes an event calendar, image gallery, workshop info, and a contact page.

## Demo

A live demo is available at: **http://rumprobiert.rolling-wheels.net/**

## Features

- Event calendar (powered by FullCalendar)
- Image gallery & carousel
- Workshops, history, and contact pages
- Downloads section for our forms

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend/CMS:** PHP (in `php/`)
- **Data:** JSON-based content

## Getting Started

**1. Create `user.xml`** in `php/php_playground/` to define your users. The password must be a PHP bcrypt hash. Generate one by running:

```bash
php -r "echo password_hash('selectedpassword', PASSWORD_DEFAULT);"
```

Then create `php/php_playground/user.xml` with the following structure (add one `<user>` block per user):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<users>
    <user>
        <username>your_username</username>
        <password>$2y$12$...</password>  <!-- paste the generated hash here -->
        <email></email>
        <role>admin</role>
    </user>
</users>
```

Available roles: `admin`, `dev`, `platzwart` (User can have multiple).

**2. Add your own images** to the following folders inside `my-app/public/`:

- `events/` – images for your events (organized in subfolders per event)
- `leiter_bilder/` – profile pictures for your contact persons

After adding images, the manifest is regenerated automatically on the next build (`npm run build`).

**2b. Edit your content:**

- **Event content** – edit `my-app/data/data.json` to update event descriptions, dates, and other details.
- **Contact persons** – edit `my-app/app/ansprechpartner/page.tsx` directly to update the names, roles, and images of your contact persons.

**3. Start the PHP backend** (in the `php/php_playground` directory):

```bash
cd php/php_playground
php -S localhost:1234
```

**4. Start the Next.js frontend:**

```bash
cd my-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Disclaimer

This is a demo/prototype and comes with the following limitations:

- **No real user management** – authentication is minimal and not production-ready.
- **No database** – calendar events and other data are stored in flat JSON files. This works fine for a small club, but a proper database would be required for a larger audience or more concurrent users.
- **Club-specific calendar rules** – the booking/validation logic in `php/php_playground/file-api.php` reflects our club's specific rules (e.g. who can book which courts and when). If you use this as a base, you will need to modify `file-api.php` to implement your own rules.

If you plan to use this as a base for a real production site, these are the first things to address.

## Feedback & Contributions

This project is a work in progress and I'm open to feedback, suggestions, and improvements of any kind. Feel free to open an issue or reach out directly.
