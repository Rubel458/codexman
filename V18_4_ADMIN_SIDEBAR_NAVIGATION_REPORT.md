# V18.4 Admin Sidebar Navigation Update

## Scope
This update only changes the Admin Panel sidebar navigation behavior and grouping. No database schema, frontend public pages, API logic, upload logic, media persistence logic, or existing content data were changed.

## Implemented

### Collapsible sidebar parents
The following Admin sidebar sections now use click-to-expand / click-to-collapse behavior:

- About
- Portfolio
- Demo
- Downloads
- Blog
- Operations

Submenus are hidden by default unless their parent is opened or the current route belongs to that section.

### Requested menu grouping

#### Downloads
- Categories
- Download Files

#### Blog
- Categories
- Posts

#### Portfolio
- Portfolio Categories
- Portfolio Projects

#### Demo
- Demo Categories
- Demo Items

#### About
- About Page
- Our Mission
- Our Vision
- Our Philosophy
- Our Strategy
- Our Team

#### Operations
- Website Analytics
- Contact Leads
- Media Manager
- Activity Logs
- System Backup
- Profile & Security

## Behavior
- Parent click expands the submenu.
- Parent click again collapses the submenu.
- Chevron rotates when opened.
- Active parent menu receives highlighted styling.
- Active submenu item receives separate active styling.
- Hover styling remains visible.
- Smooth expand/collapse animation added.
- Only the currently selected/active parent section is automatically opened based on the route.

## Production Notes
No migration is required for this update.

Recommended validation:

```bash
npm run build
```

For deployment, redeploy normally through Docker/Dokploy.
