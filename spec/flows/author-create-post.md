# Author Creating a Draft Post

## Actor
Author (Editor)

## Preconditions
- User is authenticated
- User has role: editor or admin

## Trigger
Author initiates creation of a new post.

## Main Flow (Happy Path)
1. Author provides initial post content
2. System creates a new Post in Draft state
3. System associates the post with the author
4. System confirms draft creation

## Alternate / Error Flows
- User is not authenticated → Access denied
- User lacks permission → Action rejected
- System error occurs → Draft is not created

## Postconditions
- A new Post exists in Draft state
- Post is owned by the author
- Post is not visible to readers

## Data Invariants
- All newly created posts start in Draft state
- A post must have exactly one author
