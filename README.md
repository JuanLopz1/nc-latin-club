# NC Latin Club

Public website for **NC Latin Club**, a community space where Latin American cultures meet. The current release is a landing page with the club identity, navigation, and a courtyard hero.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |

## Project layout

```text
app/           Routes, layout, and global styles
public/images/ Static images used by the site
```

Edit `app/page.tsx` to change the home page. The development server reloads as you save.
