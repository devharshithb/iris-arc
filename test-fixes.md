# Test Plan for Iris Arc Fixes

## Issues Fixed

### 1. 401 Errors on Bootstrap
**Problem:** `listProjects` and `listChats` were getting 401 errors after login
**Root Cause:** 
- Session might not be ready when bootstrap is called
- Token not available in `getSession()` call

**Fixes Applied:**
- ✅ Added token validation in `AppBootstrapper.tsx` before calling bootstrap
- ✅ Added localStorage fallback in `apiFetch()` 
- ✅ Added delay (100ms) before calling bootstrap to ensure session is ready
- ✅ Added `useRef` to prevent multiple bootstrap calls
- ✅ Improved error logging throughout bootstrap flow

### 2. Data Not Persisting Across Reloads
**Problem:** Chats and projects disappeared after page reload
**Root Cause:** Zustand store was only persisting UI preferences, not data

**Fixes Applied:**
- ✅ Updated `partialize` to persist `threads`, `messages`, `projects`, `currentThreadId`
- ✅ Incremented version from 2 to 3 to force migration
- ✅ Data is now cached in localStorage (per-user) AND synced from server
- ✅ If server fails, local data is retained

### 3. Move to Project Not Working
**Problem:** Moving chat to project might fail silently
**Root Cause:** Backend PATCH endpoint wasn't handling `null` values correctly

**Fixes Applied:**
- ✅ Updated backend `update_chat` to use `model_dump(exclude_unset=True)`
- ✅ Now properly handles setting `project_id` to `null` (removing from project)
- ✅ Added better error handling and toast notifications in frontend
- ✅ Added logging to track assignThreadToProject calls

## Testing Steps

### Test 1: Login and Bootstrap
1. Clear localStorage and cookies
2. Login to the app
3. Check console for:
   - ✅ "🔐 Tokens synced to localStorage"
   - ✅ "[BOOTSTRAP] Starting..."
   - ✅ "[LOAD_PROJECTS] Loaded X projects from server"
   - ✅ "[LOAD_CHATS] Loaded X chats from server"
   - ✅ "[BOOTSTRAP] Complete"
4. Verify no 401 errors in console
5. Verify chats and projects appear in sidebar

### Test 2: Data Persistence
1. Login and create a chat
2. Create a project
3. Reload the page
4. Verify chat and project still appear (from localStorage cache)
5. Check that data is re-synced from server (check console logs)

### Test 3: Move to Project
1. Create a new chat
2. Create a new project
3. Right-click chat → "Move to project" → Select project
4. Verify toast shows "Moved to: [project name]"
5. Verify chat appears under project in sidebar
6. Check console for:
   - ✅ "[STORE] assignThreadToProject called: tid=..., pid=..."
   - ✅ "[STORE] Successfully updated chat project on server"
7. Reload page and verify chat is still in the project

### Test 4: Remove from Project
1. Right-click a chat that's in a project
2. Select "Remove from project"
3. Verify toast shows "Removed from [project name]"
4. Verify chat moves back to main list
5. Reload and verify it's still not in a project

## Expected Results

All tests should pass with:
- ✅ No 401 errors
- ✅ Data persists across reloads
- ✅ Move to project works correctly
- ✅ Remove from project works correctly
- ✅ Toast notifications show success/error
- ✅ Console shows proper logging at each step

## Files Changed

### Frontend
1. `/web/src/components/AppBootstrapper.tsx` - Added validation and delay
2. `/web/src/lib/chatApi.ts` - Added localStorage fallback in apiFetch
3. `/web/src/lib/store.ts` - 
   - Updated partialize to persist data
   - Improved bootstrap logging
   - Better error handling

### Backend
1. `/backend/app/api/chats/routes.py` - Fixed PATCH to handle null values properly

## Migration Notes

- Store version bumped from 2 to 3
- Users will see data re-sync on next login
- Old localStorage entries will be cleared automatically
