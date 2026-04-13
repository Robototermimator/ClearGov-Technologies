# ClearGov Technologies Prototype

Modern GovTech anti-corruption SaaS prototype built with HTML, CSS, and JavaScript.

## Features

- **Dashboard:** budget summaries, spending breakdown pie chart, monthly spend chart, and recent activity feed.
- **Whistleblowing portal:** anonymous report submission form with optional file input (UI only), confirmation message, and local history.
- **AI Fraud Detection:** simulated scan that generates suspicious transaction, duplicate payment, and anomaly alerts.
- **Professional UI:** dark SaaS layout, rounded cards, subtle shadows, responsive sidebar navigation, alert badge.
- **Login system:** localStorage-based sign in/out gate for accessing platform views.

## Run locally

1. Clone this repository.
2. Open `index.html` directly in your browser, or serve with a simple static server:

```bash
python3 -m http.server 8080
```

3. Open `http://localhost:8080`.

## Project structure

- `index.html` — app layout and sections.
- `styles.css` — dark theme, card styling, responsive behavior.
- `app.js` — state handling, Chart.js setup, report/alert logic, login flow.

## Notes

- This is a frontend prototype intended for university and portfolio demonstration.
- Data is stored only in browser `localStorage`.
