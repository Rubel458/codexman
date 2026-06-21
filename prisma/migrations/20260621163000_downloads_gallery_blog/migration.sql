-- Downloads, gallery and blog modules.
CREATE TABLE "DownloadCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DownloadCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DownloadItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "fileName" TEXT NOT NULL,
    "originalFilename" TEXT,
    "fileMimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "fileSizeBytes" INTEGER NOT NULL DEFAULT 0,
    "livePreviewUrl" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DownloadItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImageUrl" TEXT,
    "content" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DownloadCategory_slug_key" ON "DownloadCategory"("slug");
CREATE UNIQUE INDEX "DownloadItem_slug_key" ON "DownloadItem"("slug");
CREATE INDEX "DownloadItem_published_sortOrder_idx" ON "DownloadItem"("published", "sortOrder");
CREATE INDEX "DownloadItem_categoryId_idx" ON "DownloadItem"("categoryId");
CREATE INDEX "GalleryItem_published_sortOrder_idx" ON "GalleryItem"("published", "sortOrder");
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_published_publishedAt_idx" ON "BlogPost"("published", "publishedAt");
CREATE INDEX "BlogPost_sortOrder_idx" ON "BlogPost"("sortOrder");

ALTER TABLE "DownloadItem" ADD CONSTRAINT "DownloadItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DownloadCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "DownloadCategory" ("id", "name", "slug", "createdAt", "updatedAt") VALUES
('download-category-wordpress-plugins', 'WordPress Plugins', 'wordpress-plugins', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('download-category-html-templates', 'HTML Templates', 'html-templates', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('download-category-bootstrap-templates', 'Bootstrap Templates', 'bootstrap-templates', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('download-category-ai-resources', 'AI Resources', 'ai-resources', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('download-category-images', 'Images', 'images', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('download-category-other-resources', 'Other Resources', 'other-resources', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Menu" ("id", "label", "href", "parentId", "sortOrder", "enabled", "createdAt", "updatedAt")
SELECT 'menu-free-downloads', 'Free Downloads', '/downloads', NULL, 75, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Menu" WHERE "href" = '/downloads')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Menu" ("id", "label", "href", "parentId", "sortOrder", "enabled", "createdAt", "updatedAt")
SELECT 'menu-gallery', 'Gallery', '/gallery', NULL, 76, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Menu" WHERE "href" = '/gallery')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Menu" ("id", "label", "href", "parentId", "sortOrder", "enabled", "createdAt", "updatedAt")
SELECT 'menu-blog', 'Blog', '/blog', NULL, 77, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Menu" WHERE "href" = '/blog')
ON CONFLICT ("id") DO NOTHING;
