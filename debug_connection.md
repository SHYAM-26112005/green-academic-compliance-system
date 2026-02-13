# Debugging "Failed to fetch"

If you see "Failed to fetch" or "Network Error", follow this checklist:

## 1. Is the Backend Running?
Check your terminal. You must have a terminal window that says:
`Server is running on port 5001`

If not, open a new terminal and run:
```bash
npm run server
```

## 2. Check Browser Console
1. Right-click your frontend page → **Inspect** → **Console**.
2. If you see **CORS blocked**, ensure your `server.js` has:
   ```javascript
   app.use(cors({ origin: 'http://localhost:5173' }));
   ```

## 3. Test Connectivity
Open your browser and go to: [http://localhost:5001/ping](http://localhost:5001/ping)
- **If it says "Backend is reachable!"**: Your server is ON.
- **If it says "Site cannot be reached"**: Your server is OFF.

## 4. Port Conflict
If you get an error like `EADDRINUSE: address already in use :::5001`:
1. Find the process using port 5001 and kill it.
2. Or change the port in `.env` and update your frontend `fetch` URLs.

## 5. URL Mismatch
Ensure your frontend `fetch` uses `http://localhost:5001` (not `https` and not `5173`).
- **Wrong**: `fetch('/login')` (missing base URL)
- **Wrong**: `fetch('http://localhost:5173/login')` (frontend port)
- **Right**: `fetch('http://localhost:5001/login')` (backend port)
