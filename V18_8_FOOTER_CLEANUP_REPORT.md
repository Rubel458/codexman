# ITLabBD V18.8 — Footer Cleanup Refinement

## Fixed

- Removed the frontend newsletter subscription block from the footer.
- Removed newsletter fields from the Footer Settings admin panel.
- Removed newsletter fields from the Footer Settings API validation and save payload.
- Removed newsletter fields from the public footer settings model and fallback configuration.
- Added a production-safe migration to delete retired newsletter setting rows from the Settings table.
- Removed the decorative rounded border/ellipse that made the footer content look like a separate boxed container.
- Reduced the footer bottom spacing and made the copyright area more compact.

## Migration

New migration:

```text
prisma/migrations/20260622113000_remove_footer_newsletter_settings/migration.sql
```

This migration only deletes the retired footer newsletter setting keys:

```text
footer_newsletter_title
footer_newsletter_description
footer_newsletter_placeholder
footer_newsletter_button_text
```

No schema/table structure is changed.

## Notes

- No existing footer quick links, resource links, social links, logo, contact information, or copyright settings are removed.
- Footer remains fully dynamic from the admin panel, minus the removed newsletter section.
