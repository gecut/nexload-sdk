# Package fixture: release evidence

Current repository observations:

- package manifest version is `1.1.0`;
- peer ranges are Payload `>=3.85.0 <4` and Zod `>=4 <5`;
- `test:consumer` and `test:compat` run packed-consumer smoke;
- `.github/scripts/payload-schema-compat.sh` exists;
- `.github/workflows` contains no payload-schema compatibility workflow;
- no public API change is requested.

Review task: produce a release/compatibility evidence report. It must distinguish helper capability from active automation, avoid inventing a Changeset, and identify what packed distribution checks and version claims can actually be made.
