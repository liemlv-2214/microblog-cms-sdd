# Author Publishing a Post

## Actor
Editor (Author)

## Preconditions
- User is authenticated
- User has role: editor or admin
- Post exists in Draft state

## Trigger
Author chooses to publish a draft post.

## Main Flow (Happy Path)
1. System validates post content and permissions
2. System transitions post state from Draft to Published
3. Post becomes publicly visible to readers
4. System confirms successful publication to the author

## Alternate / Error Flows
- Validation fails → Post remains Draft, error shown
- User lacks permission → Publish is denied
- System error occurs → Post remains Draft

## Postconditions
- Post state is Published
- Post is visible to readers
- Author can view the published post

## Data Invariants
- Only Draft posts can be published
- Only editor/admin roles can publish posts
- Published posts are immutable in v1
