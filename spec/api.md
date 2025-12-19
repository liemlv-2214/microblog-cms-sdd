# API Specification – Microblog CMS (v1)

> This API specification is derived from user flows defined in `spec/flows/`.
> Only v1 features are included. API design follows REST conventions.

---


## Conventions

- Base URL: `/api`
- Format: JSON
- Authentication: Bearer Token
- Time format: ISO 8601 (UTC)

---

## Authentication & Authorization

### Auth Method
- **Header:** `Authorization: Bearer {token}`
- **Token Type:** Supabase JWT
- **Validation:** Requests to protected endpoints must include a valid JWT

### User Roles & Permissions

| Role | Post Create | Post Publish | Post Moderate | Comment Submit | Comment Moderate |
|------|:-----------:|:------------:|:-------------:|:--------------:|:----------------:|
| admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| editor | ✅ | ✅ | ❌ | ✅ | ❌ |
| viewer | ❌ | ❌ | ❌ | ✅ | ❌ |

### Error Response (All Endpoints)
- **401 Unauthorized:** Invalid or missing token
- **403 Forbidden:** Valid token, insufficient permissions
- **500 Internal Server Error:** Unexpected server error

---

## Resource: Posts

### 1. Create Post (Draft)
**Description:** Creates a new post in **draft** state.

**Source Flow:** `author-create-post.md`

**Endpoint:** `POST /api/posts`

**Authentication:** Required  
**Allowed Roles:** `editor`, `admin`

**Request Body:**
```json
{
  "title": "string (required, 5-200 chars)",
  "content": "string (required for draft, can be partial)",
  "category_ids": ["uuid-1"],
  "tag_ids": ["uuid-2", "uuid-3"]
}
```

**Validation:**
- category_ids and tag_ids: all referenced categories and tags must exist in the system

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "slug": "may change until post is published",
  "title": "My First Blog Post",
  "content": "post content...",
  "author_id": "uuid",
  "status": "draft",
  "published_at": null,
  "created_at": "2024-12-16T10:30:00Z",
  "updated_at": "2024-12-16T10:30:00Z",
  "category_ids": ["uuid-1", "uuid-2"],
  "tag_ids": ["uuid-3", "uuid-4"]
}
```

**Error Responses:**
- `400 Bad Request` – Missing required field, invalid data, or validation failure (category_ids or tag_ids reference non-existent entities)
- `409 Conflict` – Slug already exists
- `401 Unauthorized` – Invalid token
- `403 Forbidden` – User is not editor/admin

---

### 2. Publish Post
**Description:** Publishes an existing draft post.

**Source Flow:** `author-publish-post.md`

**Endpoint:** `PATCH /api/posts/{id}/publish`

**Authentication:** Required  
**Allowed Roles:** `editor` (own posts), `admin` (any post)

**URL Parameters:**
```
id: uuid (post id)
```

**Request Body:**
```json
{}
```

**Success Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "My First Blog Post",
  "slug": "my-first-blog-post",
  "content": "post content...",
  "author_id": "uuid",
  "status": "published",
  "published_at": "2024-12-16T10:35:00Z",
  "created_at": "2024-12-16T10:30:00Z",
  "updated_at": "2024-12-16T10:35:00Z",
  "category_ids": ["uuid-1"],
  "tag_ids": ["uuid-2"]
}
```

**Error Responses:**
- `400 Bad Request` – Post content validation failed (min 100 chars), no categories assigned, category is not active, tag_ids or category_ids reference non-existent entities
- `404 Not Found` – Post not found or already deleted
- `409 Conflict` – Post is not in draft status
- `401 Unauthorized` – Invalid token
- `403 Forbidden` – User is not author or admin

---

### 3. List Published Posts
**Description:** Returns a paginated list of published posts.

**Source Flow:** `reader-view-posts.md` (Path A, B, C)

**Endpoint:** `GET /api/posts`

**Authentication:** Optional (public endpoint)  
**Allowed Roles:** All (public)

**Query Parameters:**
```
page: integer (default: 1)
limit: integer (default: 10, max: 50)
category: string (category slug)
tag: string (optional, filter by tag slug)
search: string (optional, full-text search on title/content)
sort: "newest" | "oldest" (default: newest)
```

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "My First Blog Post",
      "slug": "my-first-blog-post",
      "author": {
        "id": "uuid",
        "email": "example@example.com"
      },
      "status": "published",
      "published_at": "2024-12-16T10:35:00Z",
      "comment_count": 3,
      "category_ids": [
        "uuid-1",
        "uuid-2"
      ],
      "tag_ids": [
        "uuid-3",
        "uuid-4"
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "total_pages": 5
  }
}
```

**Error Responses:**
- `400 Bad Request` – Invalid query parameters (e.g., limit > 50)
- `404 Not Found` – Category or tag not found

---

### 4. Get Post Detail
**Description:** Returns full details of a published post.
**Source Flow:** `reader-view-posts.md` (Path A, step 5)

**Endpoint:** `GET /api/posts/{id}`

**Authentication:** Optional  
**Allowed Roles:** All (public endpoint)

**URL Parameters:**
```
id: uuid (post id)
```

**Success Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "My First Blog Post",
  "slug": "my-first-blog-post",
  "content": "post content (markdown/html)...",
  "author": {
    "id": "uuid",
    "email": "example@example.com"
  },
  "published_at": "2024-12-16T10:35:00Z",
  "created_at": "2024-12-16T10:30:00Z",
  "comment_count": 3,
  "categories": [
    {
      "id": "uuid-1",
      "name": "",
      "slug": "",
    }
  ],
  "tags": [
    {
      "id": "uuid-2",
      "name": "",
      "slug": "",
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` – Post not found or not published

---

## Resource: Comments

### 5. Submit Comment
Submits a new comment for a published post.
New comments are created in pending state.

**Source Flow:** `reader-submit-comment.md` (Phase 1-3)

**Endpoint:** `POST /api/posts/{id}/comments`

**Authentication:** Required  
**Allowed Roles:** `viewer`, `editor`, `admin`

**URL Parameters:**
```
id: uuid (post id)
```

**Request Body:**
```json
{
  "content": "string (required, 1-5000 chars)",
  "parent_comment_id": "uuid (optional, for nested reply)"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "author": {
    "id": "uuid",
    "email": "example@example.com"
  },
  "content": "This is a helpful comment...",
  "status": "pending",
  "parent_comment_id": null,
  "created_at": "2024-12-16T14:20:00Z",
  "approved_at": null,
}
```

**Error Responses:**
- `400 Bad Request` – Empty content, content too long, invalid parent_comment_id
- `404 Not Found` – Post not found or not published, parent comment not found
- `422 Unprocessable Entity` – Comment rejected due to spam rules
- `401 Unauthorized` – Invalid token
- `409 Conflict` – Duplicate comment (recently submitted)

---

### 6. List Approved Comments
Returns approved comments for a post.

**Source Flow:** `reader-view-posts.md` (Path D)

**Endpoint:** `GET /api/posts/{id}/comments`

**Authentication:** Optional  
**Allowed Roles:** All (public)

**URL Parameters:**
```
id: uuid (post id),
```

**Query Parameters:**
```
page: integer (default: 1)
limit: integer (default: 20, max: 100)
sort: "oldest" | "newest" (default: oldest)
```

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "post_id": "uuid",
      "author": {
        "id": "uuid",
        "email": "example@example.com"
      },
      "content": "This is a helpful comment...",
      "status": "approved",
      "parent_comment_id": null,
      "created_at": "2024-12-16T14:20:00Z",
      "replies": [
        {
          "id": "uuid",
          "author": {
            "id": "uuid",
            "email": "example@example.com"
          },
          "content": "I agree!",
          "created_at": "2024-12-16T15:10:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "total_pages": 1
  }
}
```

**Notes:**
- Only returns comments with `status = "approved"`
- Excludes pending, rejected, and spam comments
- Includes single-level nested replies (if approved)
- Omits `approved_at` and internal moderation fields

**Error Responses:**
- `404 Not Found` – Post not found

---

## Resource: Moderation

### 7. Moderate Comment
Approves, rejects, or marks a comment as spam.

**Source Flow:** `moderate-comment.md` (Paths B, C, D)

**Endpoint:** `PATCH /api/comments/{id}/moderate`

**Authentication:** Required  
**Allowed Roles:** `admin`, or `editor` (only allowed to moderate comments on their own posts)

**URL Parameters:**
```
id: uuid (comment id)
```

**Request Body:**
```json
{
  "status": "approved" | "rejected" | "spam" (required),
}
```

**Success Response:** `200 OK`
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "author": {
    "id": "uuid",
    "email": "example@example.com"
  },
  "content": "This is a helpful comment...",
  "status": "approved",
  "created_at": "2024-12-16T14:20:00Z",
  "approved_at": "2024-12-16T14:30:00Z",
}
```

**Or (Rejected):**
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "content": "This is a helpful comment...",
  "status": "rejected",
}
```

**Error Responses:**
- `400 Bad Request` – Invalid status value, missing required fields
- `404 Not Found` – Comment not found
- `409 Conflict` – Comment already moderated by another moderator
- `401 Unauthorized` – Invalid token
- `403 Forbidden` – User is not admin or post author

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 400 | Bad Request (validation, invalid data) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found (resource doesn't exist) |
| 409 | Conflict (invalid state or duplicate) |
| 422 | Unprocessable Entity (semantic error, e.g., spam detected) |
| 500 | Internal Server Error |

---

## Rate Limiting (v1)

- **Default limit:** 100 requests per minute per user
- **Exception:** Public endpoints (GET /api/posts) limited to 1000 per minute
- **Response Header:** `X-RateLimit-Remaining`

---

## Pagination Standards

All list endpoints follow consistent pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "total_pages": 5
  }
}
```

---

## Notes on v1 Scope

The following features are **NOT** included in v1 API:

- ❌ User management endpoints (admin only in dashboard)
- ❌ Category/tag management endpoints (limited to created posts)
- ❌ Post editing endpoints (publish only, no edit flow)
- ❌ Post archiving/deletion endpoints (admin dashboard only)
- ❌ Comment deletion/editing endpoints (no edit after publish)
- ❌ Real-time subscriptions (WebSocket)
- ❌ Batch operations (only single-resource operations)
- ❌ Analytics endpoints (view counts, engagement metrics)
- ❌ File upload endpoints (URLs provided by client)
- ❌ Notification endpoints (email only)

---

## Related Specifications

- **Domain Model:** [spec/domain.md](spec/domain.md)
- **User Flows:** [spec/flows/](spec/flows/)
- **Product Spec:** [spec/product.md](spec/product.md)
