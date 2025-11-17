# Debug Guide - Message Persistence Issue

## Problem
User reports: "Only one chat conversation is stored, but the other conversation in other chats are disappeared"

## Root Cause Analysis

### How Messages Should Work
1. User sends messages in Chat A → Stored in `messages[chatA.id] = [msg1, msg2, ...]`
2. User switches to Chat B → Stored in `messages[chatB.id] = [msg3, msg4, ...]`
3. Store persists: `{ threads: [...], messages: { chatA.id: [...], chatB.id: [...] } }`
4. On reload: Store loads from localStorage → All messages restored
5. Bootstrap runs: Loads threads from server, keeps cached messages
6. Only loads messages for ACTIVE chat from server

### Fixes Applied

#### 1. Preserve Messages in loadChatsFromServer
**Problem:** When loading chats, the `set()` call wasn't explicitly preserving messages
**Fix:** Changed to `set((s) => ({ threads: chats, messages: s.messages }))`

#### 2. Enhanced Bootstrap Logging
**Added:**
- Log cached message count at start
- Log message count after loading chats
- Only load messages from server if not cached
- Use cached messages when available

#### 3. Enhanced loadMessagesFromServer
**Added:**
- Comprehensive logging
- Verify message preservation

## Testing Steps

### Test 1: Multi-Chat Message Persistence

1. **Setup:**
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

2. **Login and create chats:**
   - Login
   - Create Chat 1, send message "Hello from Chat 1"
   - Create Chat 2, send message "Hello from Chat 2"  
   - Create Chat 3, send message "Hello from Chat 3"

3. **Check localStorage:**
   ```javascript
   const userId = localStorage.getItem('current_user_id');
   const key = `irisarc-store-user-${userId}`;
   const data = JSON.parse(localStorage.getItem(key));
   console.log('Messages in storage:', Object.keys(data.state.messages));
   console.log('Chat 1 messages:', data.state.messages['1']);
   console.log('Chat 2 messages:', data.state.messages['2']);
   console.log('Chat 3 messages:', data.state.messages['3']);
   ```

4. **Reload page:**
   - Press F5
   - Check console for bootstrap logs:
     ```
     [BOOTSTRAP] Found X cached chat messages
     [BOOTSTRAP] After loading: 3 threads, X message arrays
     [BOOTSTRAP] Using cached messages for chat 1 (Y messages)
     ```

5. **Verify each chat:**
   - Click on Chat 1 → Should see "Hello from Chat 1"
   - Click on Chat 2 → Should see "Hello from Chat 2"
   - Click on Chat 3 → Should see "Hello from Chat 3"

6. **Check console after clicking each chat:**
   - Should NOT see `[LOAD_MESSAGES]` for cached chats
   - Messages should load instantly from cache

### Test 2: New Messages After Reload

1. **After reload, send new message in Chat 1**
2. **Switch to Chat 2** (should still see old messages)
3. **Reload again**
4. **Verify:**
   - Chat 1 has old + new messages
   - Chat 2 still has old messages
   - Chat 3 still has old messages

### Expected Console Output

#### On First Load (no cache):
```
[BOOTSTRAP] Starting...
[BOOTSTRAP] Found 0 cached chat messages
[LOAD_CHATS] Loaded 3 chats from server
[BOOTSTRAP] After loading: 3 threads, 0 message arrays
[BOOTSTRAP] Loading messages for active chat 1
[LOAD_MESSAGES] Loading messages for chat 1
[LOAD_MESSAGES] Got 2 messages from server
[LOAD_MESSAGES] Message arrays after update: 1 chats
[BOOTSTRAP] Messages loaded for active chat
[BOOTSTRAP] Complete
```

#### On Reload (with cache):
```
[STORE] Loaded state for user 1
[BOOTSTRAP] Starting...
[BOOTSTRAP] Found 3 cached chat messages
[LOAD_CHATS] Loaded 3 chats from server
[BOOTSTRAP] After loading: 3 threads, 3 message arrays  <-- KEY: Should preserve all 3
[BOOTSTRAP] Using cached messages for chat 1 (2 messages)
[BOOTSTRAP] Complete
```

#### When clicking cached chat:
- Should display immediately
- NO `[LOAD_MESSAGES]` log

#### When clicking chat without cached messages:
```
[LOAD_MESSAGES] Loading messages for chat X
[LOAD_MESSAGES] Got Y messages from server
[LOAD_MESSAGES] Message arrays after update: N chats
```

## Debugging Commands

### Check what's in localStorage:
```javascript
const userId = localStorage.getItem('current_user_id');
const key = `irisarc-store-user-${userId}`;
const stored = localStorage.getItem(key);
console.log('Stored data size:', stored?.length, 'bytes');

const data = JSON.parse(stored);
console.log('Threads:', data.state.threads.length);
console.log('Message arrays:', Object.keys(data.state.messages).length);

// Detailed view
Object.keys(data.state.messages).forEach(chatId => {
  console.log(`Chat ${chatId}: ${data.state.messages[chatId].length} messages`);
});
```

### Check current Zustand state:
```javascript
// You'll need to expose this in dev, or use React DevTools
// For now, check via components
```

### Force load messages for all chats:
```javascript
// In browser console (if you have access to store)
const store = useAppStore.getState();
const { threads } = store;
for (const thread of threads) {
  await store.loadMessagesFromServer(thread.id);
}
```

## Potential Issues to Check

### Issue 1: Messages Not Being Saved
**Symptom:** localStorage doesn't contain messages after sending
**Check:** After sending a message, check localStorage immediately
**Cause:** Persistence middleware not saving

### Issue 2: Messages Being Loaded But Overwritten
**Symptom:** Console shows "Found X cached messages" but then "0 message arrays"
**Check:** Bootstrap logs
**Cause:** `loadChatsFromServer` or another function clearing messages

### Issue 3: Only Active Chat Messages Persist
**Symptom:** Only the currently open chat has messages after reload
**Check:** localStorage before/after reload
**Cause:** Only persisting active chat messages instead of all

### Issue 4: UI Not Updating When Switching Chats
**Symptom:** Messages exist in store but don't display
**Check:** Zustand DevTools or console.log in ChatList
**Cause:** React not re-rendering or selector issue

## Files Modified

1. **web/src/lib/store.ts**
   - `loadChatsFromServer`: Explicitly preserve messages
   - `bootstrapAfterLogin`: Enhanced logging, use cached messages
   - `loadMessagesFromServer`: Added logging

## Next Steps if Issue Persists

1. Add Zustand DevTools to inspect state changes in real-time
2. Add console.log in ChatList to see what messages it receives
3. Check if sendUserMessage is properly updating messages
4. Verify persistence middleware is actually saving to localStorage
5. Check if there's a race condition between hydration and bootstrap

