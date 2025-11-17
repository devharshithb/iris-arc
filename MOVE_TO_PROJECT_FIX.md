# Fix: Move to Project Feature

## Problem
The "Move to project" feature was not working in the Sidebar component.

## Root Cause
The `assignThreadToProject()` function is async and returns a Promise, but the onClick handlers in Sidebar.tsx were:
1. **Not awaiting** the async call
2. **Showing success toasts immediately** before the operation completed
3. **Not handling errors** if the API call failed

This meant:
- The toast would show success even if the API call failed
- The function would return before completing the server update
- Errors were silently swallowed

## Locations Fixed

### 1. Move to Project Menu (Line 972-986)
**Before:**
```typescript
onClick={() => {
  assignThreadToProject(t.id, p2.id);
  setOpenMenuId(null);
  setSubMenuForMove(null);
  toast.success(`Moved to ${p2.name}`);
}}
```

**After:**
```typescript
onClick={async () => {
  try {
    await assignThreadToProject(t.id, p2.id);
    setOpenMenuId(null);
    setSubMenuForMove(null);
    toast.success(`Moved to ${p2.name}`);
  } catch (e) {
    console.error("Failed to move to project:", e);
    toast.error("Failed to move chat");
  }
}}
```

### 2. Remove from Project Button (Line 932-944)
**Before:**
```typescript
onClick={() => {
  assignThreadToProject(t.id, undefined);
  setOpenMenuId(null);
  toast.success("Removed from project");
}}
```

**After:**
```typescript
onClick={async () => {
  try {
    await assignThreadToProject(t.id, undefined);
    setOpenMenuId(null);
    toast.success("Removed from project");
  } catch (e) {
    console.error("Failed to remove from project:", e);
    toast.error("Failed to remove from project");
  }
}}
```

### 3. Drag and Drop Handler (Line 244-262)
**Before:**
```typescript
const onDragEnd = (result: DropResult) => {
  // ...
  assignThreadToProject(draggableId, newProjectId);
  toast.success(/* ... */);
};
```

**After:**
```typescript
const onDragEnd = async (result: DropResult) => {
  // ...
  try {
    await assignThreadToProject(draggableId, newProjectId);
    toast.success(/* ... */);
  } catch (e) {
    console.error("Failed to move chat via drag and drop:", e);
    toast.error("Failed to move chat");
  }
};
```

## Why ThreadMenu Was Fine
The ThreadMenu.tsx component was already properly implemented with async/await:

```typescript
const onMoveToProject = async (projectId?: string) => {
  try {
    await assignThreadToProject(currentThreadId, projectId);
    toast.success(`Moved to: ${name}`);
  } catch (e) {
    console.error("Failed to move chat:", e);
    toast.error("Failed to move chat");
  }
};
```

## Files Modified
- `web/src/components/shell/Sidebar.tsx` - Fixed 3 locations

## Testing
After this fix:
1. ✅ Click "Move to project" in Sidebar → Should see console logs and only show success if it works
2. ✅ Click "Remove from project" → Should properly remove and sync to server
3. ✅ Drag and drop chat to project → Should update and sync
4. ✅ If API fails → Should show error toast instead of success

## Expected Console Output

### On Success:
```
[STORE] assignThreadToProject called: tid=5, pid=p-abc123
[STORE] Calling apiUpdateChatProject...
[API] updateChatProject: chatId=5, projectId=p-abc123
[API] updateChatProject success
[STORE] Successfully updated chat project on server
[STORE] Saved state for user 1
```

### On Failure (e.g., network error):
```
[STORE] assignThreadToProject called: tid=5, pid=p-abc123
[STORE] Calling apiUpdateChatProject...
[API] updateChatProject: chatId=5, projectId=p-abc123
[API] updateChatProject failed: 500 - Internal Server Error
[STORE] Failed to update chat project on server: Error: updateChatProject failed: 500
Failed to move to project: Error: updateChatProject failed: 500
```

Toast will show: ❌ "Failed to move chat"

## Status
✅ **FIXED** - All move to project operations now properly await the async call and handle errors
