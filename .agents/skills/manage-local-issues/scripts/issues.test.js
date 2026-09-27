/* global console, require */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { dispatchCommand } = require("./issues.js");

function createProject(prefix) {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "manage-local-issues-"));
  const issueRoot = path.join(projectRoot, "docs/issues");
  fs.mkdirSync(issueRoot, { recursive: true });
  fs.writeFileSync(
    path.join(issueRoot, "config.json"),
    `${JSON.stringify({ id_prefix: prefix }, null, 2)}\n`,
  );
  for (const status of ["draft", "active", "closed"]) {
    fs.mkdirSync(path.join(issueRoot, status));
  }
  return projectRoot;
}

function writeIssue(
  projectRoot,
  status,
  id,
  title,
  acceptance = "- [x] complete",
  dependsOn = [],
) {
  const issuePath = path.join(projectRoot, "docs/issues", status, `${id}-sample.md`);
  fs.writeFileSync(issuePath, `---\nid: ${id}\nstatus: ${status}\ntype: refactor\ndepends_on: [${dependsOn.join(", ")}]\n---\n\n# ${title}\n\n## 受け入れ条件\n\n${acceptance}\n`);
}

function writeIssueDocument(projectRoot, status, id, body) {
  const issuePath = path.join(projectRoot, "docs/issues", status, `${id}-sample.md`);
  fs.writeFileSync(issuePath, `---\nid: ${id}\nstatus: ${status}\ntype: refactor\ndepends_on: []\n---\n\n${body.trim()}\n`);
}

function runCli(projectRoot, ...args) {
  const output = [];
  const originalLog = console.log;
  console.log = (...values) => output.push(values.join(" "));
  try {
    return {
      status: dispatchCommand(args[0], args.slice(1), projectRoot),
      stdout: output.join("\n"),
      stderr: "",
    };
  } catch (error) {
    return {
      status: 1,
      stdout: output.join("\n"),
      stderr: `Error: ${error.message}`,
    };
  } finally {
    console.log = originalLog;
  }
}

function removeProject(projectRoot) {
  fs.rmSync(projectRoot, { recursive: true, force: true });
}

test("init creates a project Issue store and refuses to overwrite it", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "manage-local-issues-init-"));
  try {
    const initialized = runCli(projectRoot, "init", "ABC");
    assert.equal(initialized.status, 0, initialized.stderr);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(projectRoot, "docs/issues/config.json"), "utf8")), {
      id_prefix: "ABC",
    });
    assert.deepEqual(fs.readdirSync(path.join(projectRoot, "docs/issues")).sort(), [
      "active",
      "closed",
      "config.json",
      "draft",
    ]);

    const repeated = runCli(projectRoot, "init", "ABC");
    assert.notEqual(repeated.status, 0);
    assert.match(repeated.stderr, /refusing to overwrite/);
  } finally {
    removeProject(projectRoot);
  }
});

test("list resolves the Issue store from the current project and accepts a generic prefix", () => {
  const projectRoot = createProject("ABC");
  try {
    fs.writeFileSync(path.join(projectRoot, "docs/issues", "draft", ".gitkeep"), "");
    writeIssue(projectRoot, "draft", "ABC-001", "Portable issue");
    writeIssue(projectRoot, "closed", "ABC-002", "Completed issue");

    const result = runCli(projectRoot, "list");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /ABC-001/);
    assert.doesNotMatch(result.stdout, /ABC-002/);
    assert.match(result.stdout, /closed issue\(s\): 1/);
  } finally {
    removeProject(projectRoot);
  }
});

test("broken Issue store structure fails closed and is not repaired by move", () => {
  const projectRoot = createProject("ABC");
  try {
    writeIssue(projectRoot, "draft", "ABC-001", "Portable issue");
    fs.rmSync(path.join(projectRoot, "docs/issues", "active"), { recursive: true });

    const listed = runCli(projectRoot, "list");
    assert.notEqual(listed.status, 0);
    assert.match(listed.stderr, /active.*not an accessible directory/);

    const moved = runCli(projectRoot, "move", "ABC-001", "active");
    assert.notEqual(moved.status, 0);
    assert.equal(fs.existsSync(path.join(projectRoot, "docs/issues", "active")), false);
  } finally {
    removeProject(projectRoot);
  }
});

test("unsupported entries in a status directory fail validation", () => {
  const projectRoot = createProject("ABC");
  try {
    fs.writeFileSync(path.join(projectRoot, "docs/issues", "closed", "README.md"), "# not an Issue\n");

    const result = runCli(projectRoot, "list");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /closed.*unsupported entries: README\.md/);
  } finally {
    removeProject(projectRoot);
  }
});

test("symbolic-link status directories fail validation", (context) => {
  const projectRoot = createProject("ABC");
  const outsideDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "manage-local-issues-outside-"));
  try {
    fs.rmSync(path.join(projectRoot, "docs/issues", "active"), { recursive: true });
    try {
      fs.symlinkSync(outsideDirectory, path.join(projectRoot, "docs/issues", "active"), "dir");
    } catch (error) {
      if (error.code === "EACCES" || error.code === "EPERM") {
        context.skip("symbolic links are unavailable in this environment");
        return;
      }
      throw error;
    }

    const result = runCli(projectRoot, "list");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /active.*must not be a symbolic link/);
  } finally {
    removeProject(projectRoot);
    removeProject(outsideDirectory);
  }
});

test("move preserves the state transition contract", () => {
  const projectRoot = createProject("ABC");
  try {
    writeIssue(projectRoot, "draft", "ABC-001", "Portable issue");

    const activated = runCli(projectRoot, "move", "ABC-001", "active");
    assert.equal(activated.status, 0, activated.stderr);
    assert.match(activated.stdout, /ABC-001: draft -> active/);
    assert.equal(fs.existsSync(path.join(projectRoot, "docs/issues/draft/ABC-001-sample.md")), false);
    assert.equal(fs.existsSync(path.join(projectRoot, "docs/issues/active/ABC-001-sample.md")), true);

    const closed = runCli(projectRoot, "move", "ABC-001", "closed");
    assert.equal(closed.status, 0, closed.stderr);
    assert.match(closed.stdout, /ABC-001: active -> closed/);
  } finally {
    removeProject(projectRoot);
  }
});

test("move rejects every transition outside the monotonic lifecycle", () => {
  const forbiddenTransitions = [
    ["draft", "draft"],
    ["draft", "closed"],
    ["active", "draft"],
    ["active", "active"],
    ["closed", "draft"],
    ["closed", "active"],
    ["closed", "closed"],
  ];

  for (const [sourceStatus, targetStatus] of forbiddenTransitions) {
    const projectRoot = createProject("ABC");
    try {
      writeIssue(projectRoot, sourceStatus, "ABC-001", "Monotonic issue");

      const result = runCli(projectRoot, "move", "ABC-001", targetStatus);
      assert.notEqual(result.status, 0, `${sourceStatus} -> ${targetStatus} unexpectedly succeeded`);
      assert.match(result.stderr, new RegExp(`Transition '${sourceStatus}' -> '${targetStatus}' is not allowed\\.`));
      assert.equal(
        fs.existsSync(path.join(projectRoot, "docs/issues", sourceStatus, "ABC-001-sample.md")),
        true,
      );
      if (sourceStatus !== targetStatus) {
        assert.equal(
          fs.existsSync(path.join(projectRoot, "docs/issues", targetStatus, "ABC-001-sample.md")),
          false,
        );
      }
    } finally {
      removeProject(projectRoot);
    }
  }
});

test("move retains active-count, dependency, and acceptance guards", () => {
  const activeCountProject = createProject("ABC");
  try {
    writeIssue(activeCountProject, "active", "ABC-001", "Existing active issue");
    writeIssue(activeCountProject, "draft", "ABC-002", "Second issue");

    const result = runCli(activeCountProject, "move", "ABC-002", "active");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Another issue is already active\. Move it to closed first\./);
    assert.equal(fs.existsSync(path.join(activeCountProject, "docs/issues/draft/ABC-002-sample.md")), true);
  } finally {
    removeProject(activeCountProject);
  }

  const dependencyProject = createProject("ABC");
  try {
    writeIssue(dependencyProject, "draft", "ABC-001", "Unresolved dependency");
    writeIssue(dependencyProject, "draft", "ABC-002", "Dependent issue", "- [x] complete", ["ABC-001"]);

    const result = runCli(dependencyProject, "move", "ABC-002", "active");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unresolved dependencies: ABC-001\./);
    assert.equal(fs.existsSync(path.join(dependencyProject, "docs/issues/draft/ABC-002-sample.md")), true);
  } finally {
    removeProject(dependencyProject);
  }

  const acceptanceProject = createProject("ABC");
  try {
    writeIssue(acceptanceProject, "active", "ABC-001", "Incomplete issue", "- [ ] incomplete");

    const result = runCli(acceptanceProject, "move", "ABC-001", "closed");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /All acceptance criteria must be checked before closing an issue\./);
    assert.equal(fs.existsSync(path.join(acceptanceProject, "docs/issues/active/ABC-001-sample.md")), true);
  } finally {
    removeProject(acceptanceProject);
  }
});

test("usage documents only monotonic move transitions", () => {
  const projectRoot = createProject("ABC");
  try {
    const result = runCli(projectRoot);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /move <PREFIX-000> <next-status>/);
    assert.match(result.stdout, /allowed move transitions: draft -> active; active -> closed/);
    assert.doesNotMatch(result.stdout, /move <PREFIX-000> <draft\|active\|closed>/);
  } finally {
    removeProject(projectRoot);
  }
});

test("withdrawn proposals can follow the normal lifecycle without faking completion", () => {
  const projectRoot = createProject("ABC");
  try {
    writeIssueDocument(
      projectRoot,
      "draft",
      "ABC-001",
      `# Withdrawn issue

## 当初の提案（未実装）

### 問題

旧提案の問題は実装しない。

### 受け入れ条件

- （未実装）旧提案の条件を完了しない。

## 問題

提案を撤回した。

## 意図

撤回理由と検証記録を保存する。

## 受け入れ条件

- [x] 撤回理由と検証記録を保存した。
`,
    );

    const activated = runCli(projectRoot, "move", "ABC-001", "active");
    assert.equal(activated.status, 0, activated.stderr);
    const closed = runCli(projectRoot, "move", "ABC-001", "closed");
    assert.equal(closed.status, 0, closed.stderr);
    assert.match(closed.stdout, /ABC-001: active -> closed/);
    const closedContent = fs.readFileSync(
      path.join(projectRoot, "docs/issues/closed/ABC-001-sample.md"),
      "utf8",
    );
    assert.match(closedContent, /当初の提案（未実装）/);
    assert.match(closedContent, /- （未実装）旧提案の条件を完了しない。/);
    assert.doesNotMatch(closedContent, /- \[x\] 旧提案の条件/);
  } finally {
    removeProject(projectRoot);
  }
});

test("invalid prefixes fail before creating project state", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "manage-local-issues-invalid-"));
  try {
    const result = runCli(projectRoot, "init", "bad-prefix");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Issue prefix/);
    assert.equal(fs.existsSync(path.join(projectRoot, "docs/issues")), false);
  } finally {
    removeProject(projectRoot);
  }
});
