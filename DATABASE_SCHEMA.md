# Database Schema Documentation

## Overview
This document describes the PostgreSQL database structure for the Event-Based Networking Platform.

---

## Tables

### 1. **users**
Stores all user information including participants, organizers, and super admins.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (
        role IN ('SUPER_ADMIN', 'ORGANIZER', 'ORGANIZER_PENDING', 'PARTICIPANT')
    ) DEFAULT 'PARTICIPANT',
    linkedin_url TEXT,
    company VARCHAR(150),
    designation VARCHAR(150),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Roles:**
- `SUPER_ADMIN` - Platform administrator who approves events and organizers
- `ORGANIZER` - Can create and manage events
- `ORGANIZER_PENDING` - Requested organizer role, awaiting approval
- `PARTICIPANT` - Default role for event attendees

---

### 2. **events**
Stores event information created by organizers.

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    event_date DATE,
    status VARCHAR(20) CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED')
    ) DEFAULT 'PENDING',
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Status Values:**
- `PENDING` - Awaiting super admin approval
- `APPROVED` - Event approved and accessible to participants
- `REJECTED` - Event rejected by super admin
- `ARCHIVED` - Event archived by organizer

**Slug:** Unique identifier used for QR codes and shareable links

---

### 3. **tags**
Stores tags/categories created for each event by organizers.

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Tags help categorize participants (e.g., "Investor", "Startup Founder", "Developer")

---

### 4. **event_participants**
Tracks which users have joined which events and how they joined.

```sql
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    join_method VARCHAR(10) CHECK (join_method IN ('QR', 'LINK')),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);
```

**Join Methods:**
- `QR` - Joined by scanning QR code
- `LINK` - Joined via direct link

---

### 5. **participant_tags**
Links participants to tags within specific events (many-to-many relationship).

```sql
CREATE TABLE participant_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE
);
```

**Purpose:** Enables filtering participants by tags in event directory

---

### 6. **favorites**
Stores favorite/bookmarked participants per event.

```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    favorited_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, user_id, favorited_user_id)
);
```

**Privacy:** Favorites are private and event-specific

---

## Views

### event_participant_count
Aggregates participant counts per event for analytics.

```sql
CREATE VIEW event_participant_count AS
SELECT event_id, COUNT(*) as total_participants
FROM event_participants
GROUP BY event_id;
```

---

## Indexes

Performance optimization indexes:

```sql
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_participant_tags_event ON participant_tags(event_id);
CREATE INDEX idx_favorites_event ON favorites(event_id);
```

---

## Relationships

```
users (1) ----< (many) events [organizer_id]
events (1) ----< (many) tags
events (1) ----< (many) event_participants >---- (1) users
participant_tags >---- events, users, tags
favorites >---- events, users (2x: user_id, favorited_user_id)
```

---

## Security Notes

1. **Cascade Deletion:** All related records are automatically deleted when parent records are removed
2. **Unique Constraints:** Prevent duplicate entries (e.g., joining same event twice)
3. **Check Constraints:** Ensure only valid values for role, status, join_method
4. **UUID Primary Keys:** Prevent enumeration attacks

---

## Initial Setup Query

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Then create all tables in order (users → events → tags → event_participants → participant_tags → favorites)
```
