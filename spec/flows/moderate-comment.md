# Moderating Comments

## Actor
Moderator (admin or post author)

## Preconditions
- Moderator is authenticated
- Moderator has permission to moderate the comment
- Comment is in Pending state

## Trigger
Moderator reviews a pending comment.

## Main Flow (Happy Path)
1. Moderator reviews comment content
2. Moderator approves or rejects the comment
3. System updates the comment status
4. System confirms moderation result

## Alternate / Error Flows
- Comment already moderated → Action rejected
- Moderator lacks permission → Access denied
- System error occurs → Moderation not completed

## Postconditions
- Comment status is updated (Approved or Rejected)
- Approved comments become publicly visible
- Rejected comments remain hidden

## Data Invariants
- Only Pending comments can be moderated
- Moderation is a one-way state transition
- Only authorized users can moderate comments
