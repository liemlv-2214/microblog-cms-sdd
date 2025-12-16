# Domain Model – Microblog CMS

> Note:
> This document describes the **conceptual domain model** for v1.
> Detailed persistence, performance optimization, and audit
> implementations are intentionally deferred to later steps.

---

## Overview

The Microblog CMS domain models a content publishing platform where
users create and manage posts, organize content using categories
and tags, and interact through moderated comments.

The domain focuses on:
- Clear ownership of content
- Explicit content lifecycles
- Simple role-based access control
- Predictable moderation rules

---

## Core Entities

- **User**
- **Post**
- **Category**
- **Tag**
- **Comment**
- **PostCategory** (join)
- **PostTag** (join)

---

## Entity Details

### User
Represents an authenticated system user.

- id
- email
- role: admin | editor | viewer
- is_active

---

### Post
Represents a unit of authored content.

- id
- title
- content
- slug
- author_id
- status: draft | published | archived
- published_at

---

### Category
Represents a high-level content grouping.

- id
- name
- slug
- is_active

---

### Tag
Represents a flexible content label.

- id
- name
- slug

---

### Comment
Represents user-generated feedback on posts.

- id
- post_id
- author_id
- content
- status: pending | approved | rejected
- parent_comment_id (single-level replies)

---

### PostCategory
Join entity between Post and Category.

- post_id
- category_id

---

### PostTag
Join entity between Post and Tag.

- post_id
- tag_id

---

## Relationships

- User (1) → Post (many)
- User (1) → Comment (many)
- Post (1) → Comment (many)
- Post (many) ↔ Category (many)
- Post (many) ↔ Tag (many)
- Comment (1) → Comment (many, single-level)

---

## States & Lifecycles

### Post
- Draft → Published → Archived
- Only Published posts are publicly visible

### Comment
- Pending → Approved | Rejected
- Only Approved comments are publicly visible

---

## Business Rules

1. A post must have exactly one author
2. Only authors or admins can create posts
3. Only published posts are visible to readers
4. All comments require moderation before visibility
5. Draft posts are visible only to author and admins
6. Categories and tags are used only for published posts

---

## Out of Scope (v1)

- Post versioning and revision history
- Scheduled publishing
- Real-time notifications
- Analytics and engagement metrics
- Advanced spam detection
- Fine-grained permission system
