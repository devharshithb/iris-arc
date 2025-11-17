# Move to Project - Debugging Guide

## Issue
User reports:
1. Move to project in Sidebar is not doing anything when clicking a project
2. Header bar ThreadMenu does not show dropdown list of projects

## Debug Steps

### Step 1: Check if projects exist

Open browser console (F12) and run:
```javascript
const userId = localStorage.getItem('current_user_id');
const key = `irisarc-store-user-${userId}`;
const data = JSON.parse(localStorage.getItem(key));
console.log('Projects:', data?.state?.projects);
console.log('Number of projects:', data?.state?.projects?.length);
```

**Expected:** Should show at least 1 project
**If empty:** Create a project first!

### Step 2: Check console logs when clicking

#### For Sidebar:
1. Right-click a chat
2. Hover over "Move to project" 
3. Click on a project name

**Expected console output:**
```
[Sidebar] Moving chat 5 to project p-abc123 My Project
[STORE] assignThreadToProject called: tid=5, pid=p-abc123
[STORE] Calling apiUpdateChatProject...
[API] updateChatProject: chatId=5, projectId=p-abc123
[API] updateChatProject success
[STORE] Successfully updated chat project on server
[Sidebar] Move successful
```

#### For Header ThreadMenu:
1. Click the 3-dot menu in header
2. Hover over "Move to project"
3. Wait for submenu to appear
4. Click on a project name

**Expected console output:**
```
[ThreadMenu] Projects: 2 [{...}, {...}]
[ThreadMenu] Current thread: 5
[ThreadMenu] onMoveToProject called, projectId: p-abc123, currentThreadId: 5
[ThreadMenu] Moving to project: My Project
[STORE] assignThreadToProject called: tid=5, pid=p-abc123
...
[ThreadMenu] Move successful
```

### Step 3: Common Issues

#### Issue A: No projects showing
**Symptom:** Console shows `Projects: 0 []`
**Solution:** Create a project first:
1. Click any chat menu
2. "Move to project" → "New project"
3. Enter a name

#### Issue B: Submenu not appearing (ThreadMenu)
**Symptom:** Hovering over "Move to project" doesn't show projects list
**Check:**
- Z-index conflict (submenu has z-40)
- Console errors
- Projects array is not empty

**Debug submenu rendering:**
```javascript
// Check if submenu state is changing
// Look for logs: [ThreadMenu] Projects: X
```

#### Issue C: Click does nothing
**Symptom:** Clicking project name does nothing, no console logs
**Possible causes:**
1. Event handler not attached
2. currentThreadId is undefined
3. JavaScript error preventing execution

**Check:**
```javascript
// In console, check current thread
const data = JSON.parse(localStorage.getItem('irisarc-store-user-1'));
console.log('Current thread ID:', data?.state?.currentThreadId);
```

### Step 4: Network Tab Check

When clicking a project, check Network tab (F12 → Network):

**Should see:**
```
PATCH /api/chats/5
Status: 200
Payload: {"project_id": "p-abc123"}
Response: {"id": 5, "title": "...", "project_id": "p-abc123", ...}
```

**If Status 401:** Token issue
**If Status 404:** Chat doesn't exist
**If Status 500:** Backend error (check backend logs)

### Step 5: Visual Checks

#### ThreadMenu submenu visibility:
- Submenu should appear to the RIGHT of main menu
- Positioned at `left-full ml-2` (next to main menu + 8px margin)
- White/dark background with border
- Lists: "New project" + divider + existing projects

#### Sidebar flyout visibility:
- Portal-based flyout
- Positioned using `flyoutPos` state
- Should appear near the mouse click position

## Files with Debug Logging

1. `web/src/components/shell/ThreadMenu.tsx`
   - Logs projects count and current thread
   - Logs when onMoveToProject is called
   - Logs success/failure

2. `web/src/components/shell/Sidebar.tsx`
   - Logs when moving chat in dropdown
   - Logs success/failure

3. `web/src/lib/store.ts`
   - Logs assignThreadToProject calls
   - Logs API success/failure

4. `web/src/lib/chatApi.ts`
   - Logs API requests and responses

## How to Test

### Create a project and move a chat:

1. **Clear cache and reload:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Login**

3. **Create a project:**
   - Header menu (3 dots) → Move to project → New project
   - Name it "Test Project"

4. **Move chat to project (Header):**
   - Click 3 dots
   - Hover "Move to project"
   - Look for submenu to appear
   - Click "Test Project"
   - Check console for logs

5. **Move chat to project (Sidebar):**
   - Right-click chat
   - Hover "Move to project"
   - Look for flyout with projects
   - Click "Test Project"
   - Check console for logs

6. **Verify:**
   - Toast shows success
   - Chat appears under project in sidebar
   - Reload page - chat still in project

## Quick Fixes

### If submenu not visible in ThreadMenu:
Check z-index:
```css
/* ThreadMenu main menu */
z-40

/* Submenu should be higher or same */
z-40 or z-50
```

### If projects not loading:
Check bootstrap:
```javascript
// Should see in console on login:
[BOOTSTRAP] Starting...
[LOAD_PROJECTS] Loaded X projects from server
```

### If onClick not firing:
Check for:
- Event.stopPropagation() blocking events
- Element being covered by another element
- Pointer-events: none in CSS
