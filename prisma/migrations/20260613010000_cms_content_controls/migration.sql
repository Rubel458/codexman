-- V8: backend-managed portfolio CTAs and complete testimonial profile data
ALTER TABLE "Portfolio" ADD COLUMN "buttonLabel" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "buttonUrl" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "brandImageUrl" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "position" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "clientImageUrl" TEXT;
