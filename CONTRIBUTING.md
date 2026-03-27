# Contributing to Digital Home Starter

Thanks for your interest in contributing. This project is designed to be set up and maintained with Claude Code — the `CLAUDE.md` file is the complete technical reference.

## Getting Started

1. Fork the repo
2. Clone your fork and run `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
4. Copy `content-corpus-examples/` to `content-corpus/` and fill in your brand data
5. Run `npm run dev` to start locally

## Development Workflow

- Open the project in Claude Code — it reads `CLAUDE.md` and understands the full architecture
- Always run `npm run build` before pushing (catches TypeScript errors that `next dev` misses)
- This project runs on Cloudflare Workers via OpenNext — see the Cloudflare rules in `CLAUDE.md`

## Pull Requests

- Keep PRs focused on a single change
- Include a clear description of what changed and why
- Make sure the build passes: `npm run build`
- Don't commit `.env` files, secrets, or your `content-corpus/` directory

## Questions?

Open an issue. The `CLAUDE.md` file answers most technical questions — read it first.
