ALTER TYPE "SectionType" ADD VALUE IF NOT EXISTS 'PLATFORMS';

ALTER TABLE "ContactLead" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "ContactLead" ALTER COLUMN "phone" DROP NOT NULL;

CREATE TABLE "VisitorDaily" (
  "id" TEXT NOT NULL,
  "dateKey" TEXT NOT NULL,
  "visitorHash" TEXT NOT NULL,
  "pageViews" INTEGER NOT NULL DEFAULT 1,
  "firstPath" TEXT,
  "lastPath" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VisitorDaily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VisitorDaily_dateKey_visitorHash_key" ON "VisitorDaily"("dateKey", "visitorHash");
CREATE INDEX "VisitorDaily_dateKey_idx" ON "VisitorDaily"("dateKey");
CREATE INDEX "VisitorDaily_createdAt_idx" ON "VisitorDaily"("createdAt");
