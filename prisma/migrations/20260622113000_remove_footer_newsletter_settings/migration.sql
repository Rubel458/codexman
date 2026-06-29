-- Remove retired footer newsletter configuration rows.
-- The newsletter UI was removed from the frontend and admin panel.
DELETE FROM "Settings"
WHERE "key" IN (
  'footer_newsletter_title',
  'footer_newsletter_description',
  'footer_newsletter_placeholder',
  'footer_newsletter_button_text'
);
