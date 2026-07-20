# Collection Naming Standard

## Canonical convention

```yaml
payloadCollectionSlug:
  language: English
  casing: kebab-case
  number: plural
  vocabulary: domain-oriented

typescriptDocumentType:
  casing: PascalCase
  number: singular

typescriptCollectionConfig:
  casing: PascalCase
  number: plural

postgresIdentifiers:
  casing: snake_case
  number: plural
  quoting: avoid
```

Example:

```text
Payload slug:      organization-memberships
Document type:     OrganizationMembership
Collection config: OrganizationMemberships
SQL identifier:    organization_memberships
```

Payload collection slugs are API-facing resource identifiers. Treat renaming them as a breaking schema and API change.

---

