# Factory and error contract

Text order is type, trim, case, length, pattern, customizer. Slug uses NFKC, trim, lowercase, separator conversion, collapse, and edge trimming. Number is finite; money is always a safe integer. Date requires an explicit offset and normalizes UTC.

Relationship/upload accept mono/poly and one/many ID shapes. Group and array schemas require every data descendant schema and are strict for consumers.

Static defaults parse during definition. Dynamic defaults pass opaquely. Conflict precedes schema availability and static validation. Error codes derive from `keyof PayloadSchemaErrorDataMap`; serialization excludes cause and stack.
