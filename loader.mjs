import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url))); // eslint-disable-line
const srcDir = path.join(projectRoot, "src");
const distDir = path.join(projectRoot, "dist");
const prismaDir = path.join(projectRoot, "prisma");
const distPrismaDir = path.join(distDir, "prisma");
const testsDir = path.join(projectRoot, "tests");
const distTestsDir = path.join(distDir, "tests");

const aliasRoots = [
  {
    prefix: "@/",
    src: srcDir,
    dist: distDir,
  },
  {
    prefix: "@prisma/",
    src: prismaDir,
    dist: distPrismaDir,
  },
  {
    prefix: "@tests/",
    src: testsDir,
    dist: distTestsDir,
  },
];

const candidateExtensions = [
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  "/index.ts",
  "/index.tsx",
  "/index.js",
  "/index.mjs",
];

function tryResolve(rootDir, specifier) {
  if (!rootDir) return null;
  for (const suffix of candidateExtensions) {
    const candidatePath = path.join(rootDir, `${specifier}${suffix}`);
    if (fs.existsSync(candidatePath)) {
      return pathToFileURL(candidatePath).href;
    }
  }
  return null;
}

export async function resolve(specifier, context, defaultResolve) {
  for (const alias of aliasRoots) {
    if (!specifier.startsWith(alias.prefix)) {
      continue;
    }

    const subpath = specifier.slice(alias.prefix.length);
    const parentPath = context.parentURL
      ? fileURLToPath(context.parentURL)
      : null;
    const prefersDist = parentPath
      ? parentPath.includes(`${path.sep}dist${path.sep}`)
      : false;

    const searchOrder = prefersDist
      ? [alias.dist, alias.src]
      : [alias.src, alias.dist];

    for (const root of searchOrder) {
      const resolved = tryResolve(root, subpath);
      if (resolved) {
        return {
          url: resolved,
          shortCircuit: true,
        };
      }
    }

    throw new Error(
      `Cannot resolve module alias '${specifier}' from '${parentPath ?? "<unknown>"}'.`,
    );
  }

  return defaultResolve(specifier, context, defaultResolve);
}
