# Chapter 10 - Microservices Visual Guide

Production-ready React + Vite project for the chapter website.

## Local Development

Install dependencies:

npm install

Start development server:

npm run dev

## Production Build

Create a production build:

npm run build

Preview production output locally:

npm run preview

## Deploy

### Vercel

- `vercel.json` is included with SPA rewrite support.
- Static assets under `/assets/*` are configured for long-term immutable caching.

### Netlify

- `netlify.toml` is included.
- SPA fallback redirect is configured.
- Static assets under `/assets/*` are configured for long-term immutable caching.

## Optimization Notes

- Unused Mermaid runtime has been removed to reduce dependency size.
- Vite build uses manual chunk splitting for React and Framer Motion.
- The app is configured as a static SPA deployment target.
