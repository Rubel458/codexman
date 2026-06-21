-- Production-safe refinements for downloads and blog modules.
-- No demo/default download categories should remain after this migration.

ALTER TABLE "DownloadItem" ADD COLUMN IF NOT EXISTS "additionalInfo" TEXT;

CREATE TABLE IF NOT EXISTS "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlogCategory_slug_key" ON "BlogCategory"("slug");

ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
CREATE INDEX IF NOT EXISTS "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BlogPost_categoryId_fkey'
  ) THEN
    ALTER TABLE "BlogPost"
      ADD CONSTRAINT "BlogPost_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "PromoBanner" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PromoBanner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PromoBanner_location_published_sortOrder_idx" ON "PromoBanner"("location", "published", "sortOrder");

-- Remove only the deterministic default categories that were inserted by the previous migration.
-- User-created categories use normal cuid() IDs and are not affected.
DELETE FROM "DownloadCategory"
WHERE "id" IN (
  'download-category-wordpress-plugins',
  'download-category-html-templates',
  'download-category-bootstrap-templates',
  'download-category-ai-resources',
  'download-category-images',
  'download-category-other-resources'
);
