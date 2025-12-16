# Reader Submitting a Comment

## Actor
Reader (authenticated user)

## Preconditions
- Reader is authenticated
- Post is published

## Trigger
Reader submits a comment on a published post.

## Main Flow (Happy Path)
1. Reader submits comment content
2. System validates basic comment requirements
3. System creates a new comment in Pending state
4. System confirms submission to the reader

## Alternate / Error Flows
- Validation fails → Comment is not submitted
- User is not authenticated → Redirect to login
- Post is no longer published → Submission is rejected
- System error occurs → Comment is not submitted

## Postconditions
- Comment exists in Pending state
- Comment is not visible to readers
- Comment awaits moderation

## Data Invariants
- All new comments start in Pending state
- Only approved comments are publicly visible
- Comments can only be added to published posts
