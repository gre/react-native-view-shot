/**
 * @jest-environment node
 */
import {execFileSync} from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

// React Native apps resolve this package through its "react-native" export
// condition (set by @react-native/typescript-config), i.e. the raw src/ files,
// so they are type-checked with the app's compiler options and skipLibCheck
// does not apply (#763). Check src/ against the stricter opt-in flags apps may
// use.
const strictConsumerOptions = {
  exactOptionalPropertyTypes: true,
  noPropertyAccessFromIndexSignature: true,
  noUncheckedIndexedAccess: true,
  noImplicitOverride: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  verbatimModuleSyntax: true,
};

const rootDir = path.resolve(__dirname, "../..");
const tscBin = path.join(
  path.dirname(require.resolve("typescript/package.json")),
  "bin/tsc",
);

let tmpDir: string | undefined;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "viewshot-tsc-"));
});

afterAll(() => {
  if (tmpDir) fs.rmSync(tmpDir, {recursive: true, force: true});
});

// Runs tsc on a temporary tsconfig and returns its diagnostics ("" if clean).
function typeCheck(name: string, tsconfig: object): string {
  const tsconfigPath = path.join(tmpDir!, `${name}.json`);
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig));
  try {
    execFileSync(process.execPath, [tscBin, "-p", tsconfigPath], {
      encoding: "utf8",
      stdio: "pipe",
      // A synchronous child blocks jest's own timeout.
      timeout: 50000,
    });
    return "";
  } catch (e) {
    const err = e as {stdout?: string; stderr?: string; message: string};
    return [err.stdout, err.stderr].filter(Boolean).join("\n") || err.message;
  }
}

describe("published source type-checks in strict consumer projects", () => {
  it("passes for every published src/ file", () => {
    const output = typeCheck("published", {
      // The npm package's src/ set, without our jest/node test globals.
      extends: path.join(rootDir, "tsconfig.build.json"),
      compilerOptions: {...strictConsumerOptions, noEmit: true},
    });
    expect(output).toBe("");
  }, 60000);

  it("passes with React Native's default app options (no DOM lib)", () => {
    // Mirrors @react-native/typescript-config, which native apps extend.
    const output = typeCheck("react-native-app", {
      compilerOptions: {
        ...strictConsumerOptions,
        strict: true,
        target: "esnext",
        module: "esnext",
        moduleResolution: "bundler",
        customConditions: ["react-native"],
        jsx: "react-native",
        // Same list as @react-native/typescript-config 0.88 (no DOM, no intl).
        lib: [
          "es2019",
          "es2020.bigint",
          "es2020.date",
          "es2020.number",
          "es2020.promise",
          "es2020.string",
          "es2020.symbol.wellknown",
          "es2021.promise",
          "es2021.string",
          "es2021.weakref",
          "es2022.array",
          "es2022.error",
          "es2022.object",
          "es2022.string",
          "es2024.promise",
          "esnext.promise",
        ],
        types: [],
        isolatedModules: true,
        skipLibCheck: true,
        esModuleInterop: true,
        noEmit: true,
      },
      files: [path.join(rootDir, "src/index.tsx")],
    });
    expect(output).toBe("");
  }, 60000);
});
