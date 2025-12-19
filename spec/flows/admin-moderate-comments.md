# Flow: Admin Moderate Comments

## Overview
Admins review and moderate user-submitted comments, updating their status (approve, reject, spam).
Comments initially created with status = "pending" become visible to readers after approval.

---

## Actor
**Admin** – User with admin role who can moderate comments

---

## Preconditions
- Admin is authenticated
- Admin has admin role
- At least one comment exists with status = "pending"

---

## Trigger
Admin opens moderation screen to review pending comments

---

## Main Flow

1. System retrieves all comments with status = "pending"
2. System displays list of pending comments ordered by creation date
3. Admin reviews comment content and author information
4. Admin selects an action for a comment:
   - **Approve**: Comment becomes public (status = "approved")
   - **Reject**: Comment is hidden from readers (status = "rejected")
   - **Mark as Spam**: Comment flagged as spam (status = "spam")
5. System updates comment status
6. Updated comment is removed from pending list
7. System confirms action to admin

---

## Alternate Flows

### A1: Comment Already Moderated
**Trigger:** Admin tries to moderate a comment that was already processed

1. System returns error: "Comment already moderated"
2. Admin is notified
3. Flow ends

### A2: Unauthorized Access
**Trigger:** Non-admin user attempts to access moderation screen

1. System returns 403 Forbidden
2. User is denied access
3. Flow ends

### A3: No Pending Comments
**Trigger:** Admin opens moderation screen with no pending comments

1. System displays empty list
2. Admin sees message: "No pending comments"
3. Flow ends

---

## Postconditions
- Comment status is updated in system
- Approved comments are visible to public readers
- Rejected and spam comments remain hidden from public

---

## Constraints

### V1 Scope (Not Implemented)
- No pagination (all pending comments returned at once)
- No notifications to comment author
- No bulk moderation actions
- No comment editing
- No comment deletion
- No appeal process

### Design Notes
- Moderation is immediate (no queuing or approval chain)
- No reason/note required for reject or spam actions
- Admins can see all comments regardless of post

---

## Related API Endpoints

- `GET /api/comments/pending` – Retrieve pending comments
- `PATCH /api/comments/{id}/moderate` – Update comment status
