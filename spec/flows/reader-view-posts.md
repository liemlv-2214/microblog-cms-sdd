# Reader Viewing Posts

## Actor
Reader (authenticated or guest)

## Preconditions
- At least one post is published

## Trigger
Reader navigates to the site or opens a post link.

## Main Flow (Happy Path)
1. Reader requests a list of published posts
2. System presents publicly visible posts
3. Reader selects a post to read
4. System displays the full post content
5. Reader reads the post and may continue browsing

## Alternate / Error Flows
- No published posts → Empty state shown
- Post not found or unpublished → 404 page shown
- Category does not exist → Error page shown
- Search yields no results → Empty search result shown

## Postconditions
- Reader has viewed published content
- No system state is modified

## Data Invariants
- Only published posts are visible to readers
- Draft or archived posts are never exposed
- Only approved comments are visible
