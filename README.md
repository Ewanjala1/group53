# Northstar Support Deflection MVP

This project is a simple support tool for **Northstar Retail Co.** It helps customers find answers before they need to contact a support agent.

The project was built as a team sprint by Group 53.

## What the project can help with

The MVP supports these three common customer questions:

1. **Order status** — customers can ask where an order is and see delivery information.
2. **Returns and refunds** — customers can check whether they can return an item and get return guidance.
3. **Stock availability** — customers can check whether an item or size is available.

It also includes a customer self-service portal and a support-agent triage view.

## Project folders

| Folder or file | What it does |
|---|---|
| `src/` | Contains the website pages and user interface. |
| `python_engine/` | Contains the Python support logic for orders, returns, stock, and ticket classification. |
| `python_engine/test_suite.py` | Contains the Python tests. |
| `python_engine/simulate_tickets.py` | Simulates support tickets for testing. |
| `server.ts` | Starts the local development server. |
| `.env.example` | Shows the environment variables needed for optional AI features. |

## What you need before starting

- Node.js 18 or newer
- Python 3.10 or newer
- Git

## How to run the website locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Ewanjala1/group53.git
   cd group53
   ```

2. Install the website packages:

   ```bash
   npm install
   ```

3. Copy the example environment file:

   ```bash
   copy .env.example .env
   ```

   On macOS or Linux, use:

   ```bash
   cp .env.example .env
   ```

4. If you need Gemini AI features, add your own key to `.env`:

   ```text
   GEMINI_API_KEY="your_key_here"
   ```

   Never upload `.env` or your API key to GitHub.

5. Start the project:

   ```bash
   npm run dev
   ```

6. Open the local address shown in the terminal.

## How to run the Python tests

From the main project folder, run:

```bash
python -m unittest python_engine.test_suite
```

Record only the real test result in the project audit log.

## Known limitations

- The MVP uses demonstration data and is not connected to Northstar's real customer systems.
- Real courier tracking needs approved courier API access.
- Real refunds need approved payment-provider access.
- Production use needs security testing and safe handling of customer data.

## Team contribution rules

- Create your own branch before editing files.
- Keep each task under four hours.
- Update the project board on the same day as your work.
- Use clear commit messages, for example `docs: update README`.
- Record real commits and pull requests in the audit log.

## Links

- Live demo: https://group53-nine.vercel.app/
- Repository: https://github.com/Ewanjala1/group53
