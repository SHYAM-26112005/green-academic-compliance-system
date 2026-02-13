# Network Access Guide

## Quick Reference

Your Green Academic Compliance System is now accessible from any device on your local network!

### Access URLs

**From this computer (localhost):**
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

**From other devices on your network:**
- Frontend: http://\<YOUR_IP\>:5173
- Backend: http://\<YOUR_IP\>:5001

Replace `<YOUR_IP>` with your actual local IP address (see below).

---

## Finding Your IP Address

### Windows (PowerShell/CMD):
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet).

### Quick Command:
```powershell
ipconfig | findstr /i "IPv4"
```

---

## Configuration Changes Made

### ✅ Backend Server
**File**: `backend/server.js`

Changed from:
```javascript
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

To:
```javascript
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📡 Local:            http://localhost:${PORT}`);
    console.log(`🌐 Network:          http://<your-ip>:${PORT}`);
    console.log(`💡 Tip: Use 'ipconfig' to find your local IP address`);
});
```

**What changed**: Added `'0.0.0.0'` as the host parameter, which tells the server to listen on all network interfaces instead of just localhost.

### ✅ Frontend Server
**File**: `frontend/vite.config.ts`

Already configured with:
```typescript
server: {
  host: true,  // This enables network access
  proxy: { ... }
}
```

**Status**: No changes needed - already configured for network access!

---

## How to Connect from Other Devices

### Step 1: Find Your IP Address
1. On your Windows PC, open PowerShell or Command Prompt
2. Run: `ipconfig`
3. Look for "IPv4 Address" (e.g., `192.168.1.100`)

### Step 2: Ensure Devices Are on Same Network
- Both your PC and the device you want to connect from must be on the same WiFi network or LAN

### Step 3: Check Windows Firewall
If you can't connect from other devices, you may need to allow the ports through Windows Firewall:

**Option 1: Quick Test (Temporary)**
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Express Backend" -Direction Inbound -LocalPort 5001 -Protocol TCP -Action Allow
```

**Option 2: Windows Defender Firewall GUI**
1. Open "Windows Defender Firewall with Advanced Security"
2. Click "Inbound Rules" → "New Rule"
3. Select "Port" → Next
4. Enter port `5173` → Next
5. Allow the connection → Next
6. Apply to all profiles → Next
7. Name it "Vite Dev Server" → Finish
8. Repeat for port `5001` (name it "Express Backend")

### Step 4: Access from Other Device
On your phone, tablet, or another computer:
1. Open a web browser
2. Navigate to: `http://<YOUR_IP>:5173`
   - Example: `http://192.168.1.100:5173`
3. You should see the Green Academic Compliance System!

---

## Testing Network Access

### From Another Device:
1. **Connect to the same WiFi network** as your development PC
2. **Open browser** on the other device
3. **Navigate to** `http://<YOUR_IP>:5173`
4. **Test the app**:
   - Register a new account
   - Login
   - Create a compliance report
   - Verify it works just like on localhost

### Troubleshooting:

**Can't connect from other devices?**
- ✅ Verify both devices are on the same network
- ✅ Check Windows Firewall settings (see Step 3 above)
- ✅ Confirm servers are running (`npm run dev`)
- ✅ Try pinging your PC from the other device
- ✅ Temporarily disable firewall to test (remember to re-enable!)

**API calls failing from other devices?**
- ✅ The Vite proxy only works when accessing through the Vite dev server
- ✅ Make sure you're accessing `http://<YOUR_IP>:5173`, not `http://<YOUR_IP>:5001`
- ✅ The frontend will automatically proxy API calls to the backend

---

## Security Notes

⚠️ **Important**: This configuration is for development only!

- Your application is now accessible to anyone on your local network
- Do NOT expose these ports to the internet
- For production deployment, use proper security measures:
  - HTTPS/SSL certificates
  - Environment-specific CORS settings
  - Firewall rules
  - Authentication and authorization
  - Rate limiting

---

## Restart Required

After making the backend changes, you need to restart the servers:

1. **Stop the current servers**: Press `Ctrl+C` in the terminal running `npm run dev`
2. **Restart**: Run `npm run dev` again
3. **Check the output**: You should see the new network access messages

The backend will now show:
```
✅ Server is running on port 5001
📡 Local:            http://localhost:5001
🌐 Network:          http://<your-ip>:5001
💡 Tip: Use 'ipconfig' to find your local IP address
```

---

## Summary

✅ **Backend**: Now listening on `0.0.0.0:5001` (all network interfaces)
✅ **Frontend**: Already configured with `host: true`
✅ **Access**: Available from any device on your local network

**Next Steps**:
1. Restart the servers if not already done
2. Find your IP address using `ipconfig`
3. Test access from another device on your network
4. Configure Windows Firewall if needed
