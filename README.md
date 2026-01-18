This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
# Houseoftransformation-nextjs


General Pattern - Add these to ALL pages:
jsx// Main container
<div className="bg-white dark:bg-slate-900 dark:text-white transition-colors">

// Sections with light backgrounds
<section className="bg-slate-50 dark:bg-slate-800">

// Text colors
className="text-slate-900 dark:text-white"
className="text-slate-600 dark:text-slate-300"
className="text-slate-500 dark:text-slate-400"

// Borders
className="border-slate-200 dark:border-slate-700"

// Cards/Boxes
className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"

// Buttons (non-primary)
className="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"

// Shadows
className="shadow-md dark:shadow-slate-900"
For Each Component:

AboutSection.jsx - Add dark:bg-slate-900 dark:text-white to main div, dark:bg-slate-800 to cards
HeroSection.jsx - Add dark:bg-slate-900 to background
EventList.jsx - Add dark:bg-slate-800 to event cards, dark:text-white to text
ServiceAreaCard.jsx - Add dark:bg-slate-800 dark:text-white
SermonCard.jsx - Add dark:bg-slate-800 dark:text-white
LiveStreamSection.jsx - Add dark:bg-slate-900
DonationSection.jsx - Add dark:bg-slate-800

Quick Find & Replace in VS Code:

Search: bg-white → Replace with: bg-white dark:bg-slate-900
Search: text-gray-900 → Replace with: text-gray-900 dark:text-white
Search: text-slate-600 → Replace with: text-slate-600 dark:text-slate-300
Search: border-slate-200 → Replace with: border-slate-200 dark:border-slate-700

That's it! Follow this pattern consistently and all pages will support dark mode! 🌙