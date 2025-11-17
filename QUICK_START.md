# Quick Start Guide - Fixed Iris Arc

## What Was Fixed

✅ **401 Authentication Errors** - No more "listProjects failed: 401" or "listChats failed: 401"  
✅ **Data Persistence** - Chats and projects now persist across page reloads  
✅ **Move to Project** - Chat project assignment now works correctly  

---

## How to Test the Fixes

### Step 1: Restart Your Development Environment

```bash
# Terminal 1 - Backend (if not already running)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend  
cd web
pnpm dev
```

The backend should auto-reload and pick up the changes. If not, restart it manually.

### Step 2: Clear Your Browser Cache

**Important:** You must clear localStorage to test properly.

**Option A - Chrome/Edge:**
1. Press `F12` to open DevTools
2. Go to **Application** tab
3. Click **Local Storage** → `http://localhost:3000`
4. Right-click → **Clear**
5. Also clear **Session Storage**
6. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

**Option B - Firefox:**
1. Press `F12` to open DevTools
2. Go to **Storage** tab
3. Click **Local Storage** → `http://localhost:3000`
4. Right-click → **Delete All**
5. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

**Option C - Quick Console Method:**
1. Press `F12` → **Console** tab
2. Run: `localStorage.clear(); sessionStorage.clear(); location.reload(true);`

### Step 3: Login and Verify Bootstrap

1. **Login** to the application
2. **Open Console** (F12 → Console tab)
3. **Look for these logs** (in order):

```
🔐 Tokens synced to localStorage
🔄 Bootstrapping chats from backend…
[BOOTSTRAP] Starting...
[LOAD_PROJECTS] Loaded X projects from server
[BOOTSTRAP] Projects loaded
[LOAD_CHATS] Loaded X chats from server
[BOOTSTRAP] Chats loaded
[BOOTSTRAP] Complete
```

4. **Verify NO errors** like:
   - ❌ `listProjects failed: 401`
   - ❌ `listChats failed: 401`

### Step 4: Test Data Persistence

1. **Create a chat** (click "+" or start typing)
2. **Create a project**:
   - Click the menu (⋮) on a chat
   - Select "Move to project" → "Create new project"
   - Enter name: "Test Project"
3. **Reload the page** (F5)
4. **Verify**:
   - ✅ Your chat is still there
   - ✅ Your project is still there
   - ✅ Console shows re-sync logs

### Step 5: Test Move to Project

1. **Create a new chat**
2. **Right-click** the chat → **"Move to project"**
3. **Select "Test Project"**
4. **Verify**:
   - ✅ Toast shows: "Moved to: Test Project"
   - ✅ Chat appears under project in sidebar
   - ✅ Console shows:
     ```
     [STORE] assignThreadToProject called: tid=..., pid=...
     [STORE] Calling apiUpdateChatProject...
     [STORE] Successfully updated chat project on server
     ```
5. **Reload the page** (F5)
6. **Verify**:
   - ✅ Chat is still in the project

### Step 6: Test Remove from Project

1. **Right-click** a chat that's in a project
2. **Select "Remove from project"**
3. **Verify**:
   - ✅ Toast shows: "Removed from Test Project"
   - ✅ Chat moves back to main list (no project)
   - ✅ Console shows successful API call
4. **Reload the page** (F5)
5. **Verify**:
   - ✅ Chat is still not in any project

---

## Troubleshooting

### Still Getting 401 Errors?

**Check:**
1. Backend is running on port 8000
2. You're logged in (check session in DevTools → Application → Cookies)
3. localStorage has `access_token` (DevTools → Application → Local Storage)
4. Console shows "Tokens synced to localStorage"

**Fix:**
- Logout and login again
- Clear localStorage and cookies
- Restart both backend and frontend

### Data Not Persisting?

**Check:**
1. Console for `[BOOTSTRAP]` logs
2. LocalStorage has `irisarc-store-user-{userId}` key
3. Check the stored data: 
   ```javascript
   console.log(localStorage.getItem('irisarc-store-user-1'))
   ```

**Fix:**
- Hard refresh (Ctrl+Shift+R)
- Clear localStorage and reload
- Check browser console for errors

### Move to Project Not Working?

**Check:**
1. Console for `[STORE] assignThreadToProject` logs
2. Network tab (F12 → Network) for PATCH request to `/api/chats/{id}`
3. Response status (should be 200)
4. Response body has updated `project_id`

**Fix:**
- Check backend logs for errors
- Verify backend auto-reloaded with new code
- Test the API directly:
  ```bash
  curl -X PATCH http://localhost:8000/api/chats/1 \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"project_id": "p-test123"}'
  ```

---

## Console Debugging Commands

### Check if tokens are stored:
```javascript
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));
```

### Check stored data:
```javascript
// Find your user ID first
const userId = 1; // or check session
const key = `irisarc-store-user-${userId}`;
const data = JSON.parse(localStorage.getItem(key) || '{}');
console.log('Threads:', data.state?.threads);
console.log('Projects:', data.state?.projects);
```

### Manually trigger bootstrap:
```javascript
const { bootstrapAfterLogin } = window.__NEXT_DATA__.props.pageProps;
// Or in React DevTools:
// Find useAppStore and call: store.bootstrapAfterLogin()
```

### Check Zustand store state:
```javascript
// In React DevTools Console
$r.store.getState(); // if you've selected a component using the store
```

---

## Expected Behavior (Summary)

| Action | Expected Result | Verification |
|--------|----------------|--------------|
| **Login** | No 401 errors, data loads | Console logs + sidebar populated |
| **Create chat** | Chat appears in sidebar | Immediate + after reload |
| **Create project** | Project appears in sidebar | Immediate + after reload |
| **Move chat to project** | Success toast, chat under project | Immediate + after reload |
| **Remove from project** | Success toast, chat in main list | Immediate + after reload |
| **Reload page** | All data preserved | Same chats/projects visible |

---

## API Endpoints (for Testing)

### Test Authentication:
```bash
curl http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test List Projects (with token):
```bash
curl http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test List Chats (with token):
```bash
curl http://localhost:8000/api/chats/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Move Chat to Project:
```bash
curl -X PATCH http://localhost:8000/api/chats/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id":"p-abc123"}'
```

### Test Remove from Project:
```bash
curl -X PATCH http://localhost:8000/api/chats/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id":null}'
```

---

## Files Changed

If you need to review or revert:

1. `web/src/components/AppBootstrapper.tsx`
2. `web/src/lib/chatApi.ts`
3. `web/src/lib/store.ts`
4. `backend/app/api/chats/routes.py`

View changes:
```bash
git diff web/src/components/AppBootstrapper.tsx
git diff web/src/lib/chatApi.ts
git diff web/src/lib/store.ts
git diff backend/app/api/chats/routes.py
```

---

## Success Criteria

✅ Login completes without 401 errors  
✅ Chats persist after page reload  
✅ Projects persist after page reload  
✅ Move to project shows success toast  
✅ Chat appears under project in sidebar  
✅ Project assignment persists after reload  
✅ Remove from project works correctly  
✅ All console logs show expected flow  

---

## Need Help?

Check the detailed fix summary: `FIXES_SUMMARY.md`
Check the test plan: `test-fixes.md`

Or review console logs - all operations now have detailed logging with `[BOOTSTRAP]`, `[STORE]`, `[LOAD_*]` prefixes.
