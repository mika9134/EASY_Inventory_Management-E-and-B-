# ENB Inventory



---

##Quick Start

### 1. Clone the project
```bash
git clone <repo-url>
cd enb-inventory-app
cp .env.example .env
```

Update the `.env` file with:
- `DATABASE_URL` – PostgreSQL database URL
- `CLOUDINARY_*` – Cloudinary credentials

### 2. Install dependencies
```bash
npm install
```

### 3. Setup the database
```bash
npm run db:push
```

### 4. Start the app
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) – server‑side rendering with React 19
- **Styling**: Tailwind CSS v4 + Framer Motion for fluid animations
- **Database**: PostgreSQL via Drizzle ORM – type‑safe schema definitions
- **Assets**: Cloudinary – optimized image delivery
- **Typography**: Outfit (headings) & Inter (body) – imported from Google Fonts
- **Icons**: Lucide‑React – modern SVG icon set
---

### Project Structure

```bash
src/
├── app/
├── components/
├── db/
├── lib/
└── styles/
```

---

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a Pull Request

---
