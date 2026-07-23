import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { apiPackages } from "./api-packages.mjs";

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(docsRoot, "../..");
const outputPath = resolve(docsRoot, "src/generated/api-catalog.json");

function sanitizeSignature(signature) {
  let clean = signature;
  for (const entry of apiPackages) {
    const packageRoot = resolve(repositoryRoot, entry.sourcePath).replaceAll(
      "\\",
      "/",
    );
    const escapedRoot = packageRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    clean = clean.replace(
      new RegExp(
        `import\\(["']${escapedRoot}/(?:dist|src)(?:/[^"']*)?["']\\)`,
        "g",
      ),
      `import("${entry.name}")`,
    );
  }
  return clean;
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function symbolCategory(symbol) {
  const declarations = symbol.declarations ?? [];
  if (declarations.some(ts.isFunctionDeclaration)) return "functions";
  if (declarations.some(ts.isClassDeclaration)) return "classes";
  if (declarations.some(ts.isInterfaceDeclaration)) return "interfaces";
  if (declarations.some(ts.isTypeAliasDeclaration)) return "types";
  return "constants";
}

function declarationSignature(checker, symbol, declaration) {
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const calls = type.getCallSignatures();
  if (calls.length > 0) {
    return sanitizeSignature(
      calls
        .map(
          (signature) =>
            `${symbol.name}${checker.signatureToString(
              signature,
              declaration,
              ts.TypeFormatFlags.NoTruncation |
                ts.TypeFormatFlags.WriteArrowStyleSignature,
            )}`,
        )
        .join("\n"),
    );
  }

  if (
    ts.isInterfaceDeclaration(declaration) ||
    ts.isTypeAliasDeclaration(declaration)
  ) {
    return declaration.getText().replace(/^export\s+/, "");
  }
  if (ts.isClassDeclaration(declaration)) {
    return `class ${symbol.name}`;
  }
  return sanitizeSignature(
    `${symbol.name}: ${checker.typeToString(type, declaration, ts.TypeFormatFlags.NoTruncation)}`,
  );
}

function publicSymbol(checker, exportedSymbol, packageEntry) {
  const symbol =
    exportedSymbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(exportedSymbol)
      : exportedSymbol;
  const declaration =
    symbol.declarations?.[0] ?? exportedSymbol.declarations?.[0];
  if (!declaration)
    throw new Error(
      `${packageEntry.name}: ${exportedSymbol.name} has no declaration.`,
    );

  const sourceFile = declaration.getSourceFile();
  const line =
    sourceFile.getLineAndCharacterOfPosition(declaration.getStart()).line + 1;
  const source = relative(repositoryRoot, sourceFile.fileName).replaceAll(
    "\\",
    "/",
  );
  const documentation = ts
    .displayPartsToString(symbol.getDocumentationComment(checker))
    .trim();
  const category = symbolCategory(symbol);

  return {
    name: exportedSymbol.name,
    category,
    signature: declarationSignature(checker, symbol, declaration),
    description:
      documentation ||
      `Public ${category.slice(0, -1)} exported by ${packageEntry.name}.`,
    source,
    line,
    sourceUrl: `https://github.com/gecut/nexload-sdk/blob/main/${source}#L${line}`,
  };
}

function createCatalog() {
  const entries = apiPackages.map((entry) => ({
    ...entry,
    absoluteEntry: resolve(docsRoot, entry.entry),
  }));
  const program = ts.createProgram(
    entries.map((entry) => entry.absoluteEntry),
    {
      baseUrl: repositoryRoot,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      paths: Object.fromEntries(
        entries.map((entry) => [
          entry.name,
          [`${entry.sourcePath}/src/index.ts`],
        ]),
      ),
      target: ts.ScriptTarget.ESNext,
      skipLibCheck: true,
      strict: true,
    },
  );
  const checker = program.getTypeChecker();

  return Object.fromEntries(
    entries.map((entry) => {
      const sourceFile = program.getSourceFile(entry.absoluteEntry);
      const moduleSymbol =
        sourceFile && checker.getSymbolAtLocation(sourceFile);
      if (!sourceFile || !moduleSymbol)
        throw new Error(`Cannot load public entrypoint for ${entry.name}.`);

      const symbols = checker
        .getExportsOfModule(moduleSymbol)
        .map((symbol) => publicSymbol(checker, symbol, entry))
        .sort(
          (left, right) =>
            compareText(left.category, right.category) ||
            compareText(left.name, right.name),
        );

      return [
        entry.id,
        {
          id: entry.id,
          name: entry.name,
          sourcePath: entry.sourcePath,
          symbols,
        },
      ];
    }),
  );
}

const serialized = `${JSON.stringify(createCatalog(), null, 2)}\n`;
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  const current = readFileSync(outputPath, "utf8");
  if (current !== serialized) {
    console.error(
      "API catalog is stale. Run `pnpm --filter docs content:api:write`.",
    );
    process.exit(1);
  }
  console.log("API catalog matches all 10 public entrypoints.");
} else {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  console.log(
    `Generated API catalog at ${relative(repositoryRoot, outputPath)}.`,
  );
}
