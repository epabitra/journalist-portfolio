# Admin Password Change Feature - Implementation Plan

## Current Setup
- Password hash stored in Google Apps Script PropertiesService (`ADMIN_PASSWORD_HASH`)
- Password hashing uses: `hashPassword(password, 'salt')` with `JWT_SECRET`
- Authentication via Google Apps Script Web App API
- Admin login requires email + password

## Requirements
1. Admin should be able to change password independently
2. Must verify current password before allowing change
3. Should be secure and follow same hashing mechanism
4. Should not require developer intervention
5. Should provide clear feedback on success/failure

## Proposed Solution: API-Based Password Change

### Approach Overview
Add a new API endpoint in Google Apps Script that allows authenticated admin to change their password. The endpoint will:
1. Verify current password
2. Hash new password using same method
3. Update ADMIN_PASSWORD_HASH in PropertiesService
4. Optionally invalidate all existing sessions (force re-login)

### Implementation Components

#### 1. Google Apps Script Backend Changes

**New Function: `handleChangePassword(data)`**
```javascript
function handleChangePassword(data) {
  // 1. Verify user is authenticated (check token)
  // 2. Verify current password matches
  // 3. Validate new password (strength, length, etc.)
  // 4. Hash new password using same method
  // 5. Update ADMIN_PASSWORD_HASH in PropertiesService
  // 6. Optionally: Invalidate all sessions (force re-login)
  // 7. Return success response
}
```

**New API Action: `changePassword`**
- Add to admin actions list
- Requires authentication token
- Accepts: `currentPassword`, `newPassword`, `confirmPassword`

**Security Considerations:**
- ✅ Verify current password before allowing change
- ✅ Validate new password strength (min length, complexity)
- ✅ Ensure new password != current password
- ✅ Hash new password using same algorithm (`hashPassword` with same salt)
- ✅ Update PropertiesService atomically
- ⚠️ Consider invalidating all sessions after password change (security best practice)

#### 2. Frontend Changes

**New Component: `ChangePassword.jsx` (or section in ProfileEditor)**
- Form with fields:
  - Current Password (required)
  - New Password (required, with strength indicator)
  - Confirm New Password (required, must match)
- Validation:
  - Current password must be correct
  - New password strength requirements
  - Password confirmation match
- Success/Error handling
- Redirect to login after successful change (if sessions invalidated)

**New API Method: `adminAPI.changePassword()`**
```javascript
changePassword: async (currentPassword, newPassword, confirmPassword) => {
  // Call Google Apps Script API with action: 'changePassword'
  // Include authentication token
  // Handle response
}
```

**UI Location Options:**
1. **Option A:** New page/route: `/admin/change-password`
   - Pros: Dedicated page, clear separation
   - Cons: Additional navigation item
   
2. **Option B:** Section in Profile Editor (`/admin/profile`)
   - Pros: Logical location, already has admin settings
   - Cons: Might clutter profile editor
   
3. **Option C:** Settings/Account section in Dashboard
   - Pros: Central location for account settings
   - Cons: Need to create new settings section

**Recommended: Option B** - Add to Profile Editor as a new card section

#### 3. Password Validation Rules

**Minimum Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- (Optional) At least one special character

**Frontend Validation:**
- Real-time password strength indicator
- Show requirements checklist
- Validate before submission

**Backend Validation:**
- Re-validate all rules on server
- Don't trust frontend validation alone

### Implementation Steps

#### Phase 1: Backend (Google Apps Script)
1. ✅ Add `changePassword` to admin actions list
2. ✅ Create `handleChangePassword(data)` function
3. ✅ Add password validation helper function
4. ✅ Add session invalidation option (optional but recommended)
5. ✅ Test with Apps Script editor

#### Phase 2: Frontend API
1. ✅ Add `changePassword` action to `API_ACTIONS` constant
2. ✅ Add `adminAPI.changePassword()` method
3. ✅ Handle errors appropriately

#### Phase 3: Frontend UI
1. ✅ Create password change form component
2. ✅ Add password strength indicator
3. ✅ Add validation rules
4. ✅ Add to Profile Editor page
5. ✅ Add success/error notifications
6. ✅ Handle redirect after password change

#### Phase 4: Testing
1. ✅ Test password change flow
2. ✅ Test with wrong current password
3. ✅ Test with weak new password
4. ✅ Test session invalidation (if implemented)
5. ✅ Test edge cases

### Security Considerations

#### ✅ Implemented:
- Current password verification
- Password strength validation
- Authentication token required
- Same hashing algorithm as login

#### ⚠️ Consider:
- **Session Invalidation:** After password change, invalidate all existing sessions
  - Pros: Prevents unauthorized access if password was compromised
  - Cons: User must re-login immediately
  - **Recommendation:** Implement with option to keep current session

- **Rate Limiting:** Prevent brute force attempts
  - Limit password change attempts per hour
  - Track failed attempts

- **Password History:** Prevent reusing recent passwords
  - Store last N password hashes
  - Check against history before allowing change
  - **Recommendation:** Start simple, add later if needed

- **Audit Logging:** Log password changes
  - Store in a "password_changes" sheet
  - Include timestamp, IP (if available), success/failure
  - **Recommendation:** Implement for security auditing

### Alternative Approaches Considered

#### Option 1: Google Sheet Storage
- Store password hash in a protected Google Sheet
- Admin can edit directly
- **Rejected:** Less secure, visible in sheet, harder to protect

#### Option 2: External Password Manager Integration
- Use third-party service
- **Rejected:** Adds complexity, external dependency

#### Option 3: OAuth/Google Sign-In
- Replace password with Google OAuth
- **Rejected:** Major architectural change, user specifically wants password change

### Recommended Implementation Order

1. **Start Simple:**
   - Basic password change endpoint
   - Simple validation (min length)
   - No session invalidation initially

2. **Add Security:**
   - Password strength requirements
   - Session invalidation
   - Audit logging

3. **Enhance UX:**
   - Password strength indicator
   - Better error messages
   - Success confirmation

### Files to Modify

#### Google Apps Script (`GOOGLE_APPS_SCRIPT_CORS_FIX.js`)
- Add `changePassword` to admin actions
- Add `handleChangePassword()` function
- Add password validation helper

#### Frontend Files
- `src/config/constants.js` - Add `CHANGE_PASSWORD` action
- `src/services/api.js` - Add `changePassword()` method
- `src/pages/Admin/ProfileEditor.jsx` - Add password change section
- `src/utils/validation.js` - Add password strength validation

### Estimated Complexity
- **Backend:** Medium (2-3 hours)
- **Frontend API:** Low (30 minutes)
- **Frontend UI:** Medium (2-3 hours)
- **Testing:** Medium (1-2 hours)
- **Total:** ~6-8 hours

### Questions to Consider Before Implementation

1. **Session Invalidation:** Should we invalidate all sessions after password change?
   - Yes: More secure, user must re-login
   - No: Better UX, user stays logged in
   - **Recommendation:** Yes, but keep current session active

2. **Password Requirements:** How strict should password rules be?
   - Basic: 8+ characters
   - Medium: 8+ chars, mixed case, number
   - Strict: 8+ chars, mixed case, number, special char
   - **Recommendation:** Medium

3. **Error Messages:** How specific should error messages be?
   - Generic: "Password change failed"
   - Specific: "Current password is incorrect"
   - **Recommendation:** Specific for better UX, but don't reveal if email exists

4. **Password History:** Should we prevent reusing old passwords?
   - **Recommendation:** Not initially, add later if needed

### Next Steps

1. Review this plan with client
2. Confirm password requirements
3. Confirm session invalidation preference
4. Start with Phase 1 (Backend)
5. Test thoroughly before moving to frontend

---

## Summary

**Recommended Approach:** API-based password change with:
- Current password verification
- Password strength validation
- Session invalidation (optional but recommended)
- Integration into Profile Editor page
- Audit logging for security

This approach maintains security while giving admin full control over password management.

