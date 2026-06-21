-- Lightweight production stabilization: contact widget uses the existing Settings table.
-- The indexes below support the public CMS reads used by the header, sitemap,
-- homepage, blog, downloads, gallery and admin list screens.

CREATE INDEX IF NOT EXISTS "Settings_group_key_idx" ON "Settings"("group", "key");
CREATE INDEX IF NOT EXISTS "Menu_enabled_sortOrder_idx" ON "Menu"("enabled", "sortOrder");
CREATE INDEX IF NOT EXISTS "Menu_parentId_idx" ON "Menu"("parentId");
CREATE INDEX IF NOT EXISTS "Page_published_title_idx" ON "Page"("published", "title");
CREATE INDEX IF NOT EXISTS "HomepageSection_enabled_sortOrder_idx" ON "HomepageSection"("enabled", "sortOrder");
CREATE INDEX IF NOT EXISTS "Service_published_sortOrder_idx" ON "Service"("published", "sortOrder");
CREATE INDEX IF NOT EXISTS "Portfolio_published_sortOrder_idx" ON "Portfolio"("published", "sortOrder");
CREATE INDEX IF NOT EXISTS "Portfolio_categoryId_idx" ON "Portfolio"("categoryId");
CREATE INDEX IF NOT EXISTS "Demo_published_sortOrder_idx" ON "Demo"("published", "sortOrder");
CREATE INDEX IF NOT EXISTS "Demo_categoryId_idx" ON "Demo"("categoryId");
CREATE INDEX IF NOT EXISTS "Testimonial_published_sortOrder_idx" ON "Testimonial"("published", "sortOrder");
CREATE INDEX IF NOT EXISTS "CompanyLogo_published_sortOrder_idx" ON "CompanyLogo"("published", "sortOrder");
CREATE INDEX IF NOT EXISTS "Media_createdAt_idx" ON "Media"("createdAt");
CREATE INDEX IF NOT EXISTS "TeamMember_published_sortOrder_idx" ON "TeamMember"("published", "sortOrder");
