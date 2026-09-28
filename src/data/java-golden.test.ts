import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { javaGoldenFixtures } from "./java-golden";

const javacProbe = spawnSync("javac", ["-version"], { encoding: "utf8" });
const javacMajor = Number(
  `${javacProbe.stdout}\n${javacProbe.stderr}`.match(/javac\s+(\d+)/)?.[1] ?? 0,
);
const javac25Available = javacProbe.status === 0 && javacMajor >= 25;

describe.skipIf(!javac25Available)(
  "Java 25 compiler-backed content witnesses",
  () => {
    it.each(javaGoldenFixtures)("verifies $id", (fixture) => {
      const directory = mkdtempSync(join(tmpdir(), "forge-java25-golden-"));
      try {
        const files = Object.entries(fixture.files).map(([name, source]) => {
          const path = join(directory, name);
          mkdirSync(dirname(path), { recursive: true });
          writeFileSync(path, source);
          return path;
        });
        if (fixture.launcherArgs) {
          const run = spawnSync("java", fixture.launcherArgs, {
            cwd: directory,
            encoding: "utf8",
          });
          expect(run.stderr).toBe("");
          expect(run.status).toBe(0);
          expect(run.stdout).toBe(fixture.expectedOutput);
          return;
        }
        const compile = spawnSync("javac", ["--release", "25", ...files], {
          encoding: "utf8",
        });
        if (fixture.compiles === false) {
          expect(compile.status).not.toBe(0);
          expect(`${compile.stdout}\n${compile.stderr}`).toMatch(
            fixture.diagnostic ?? /error/i,
          );
          return;
        }
        expect(compile.stderr).toBe("");
        expect(compile.status).toBe(0);
        const run = spawnSync("java", ["-cp", directory, fixture.mainClass!], {
          encoding: "utf8",
        });
        expect(run.stderr).toBe("");
        expect(run.status).toBe(0);
        expect(run.stdout).toBe(fixture.expectedOutput);
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    });
  },
);
