# Augustana AI Chat — PHP + JavaScript Prototype

Non-React static prototype with AU branding, folder hierarchy, drag/drop, search, and settings modal.

## Run
1. Copy `au-chatgpt-php/` to your PHP server root (or any static server—no PHP execution needed for Phase 1).
2. Open `index.php` in your browser.

## Features
- Left sidebar with **global search** (matches chat titles across all folders).
- **Create Chat / Folder** at top-level.
- **Drag & drop** chats and folders into folders (cycle-safe).
- Three-dot menu per item: **Rename** and **Delete** only.
- Bottom-left **AU logo** button opens **Admin / Settings** modal.
- Local persistence via `localStorage` (`askOleTree/v3php`).

## Future wiring
- Persist to MySQL (see `data/chat_logs.sql` and `includes/db_connect.php`).
- Add `api/ai.php` for on-prem LLM integration.
