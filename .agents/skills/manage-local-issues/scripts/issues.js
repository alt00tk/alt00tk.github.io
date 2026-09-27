/* global console, module, process, require */

const fs = require("fs");
const path = require("path");

const STATUSES = ["draft", "active", "closed"];
const CONFIG_FILE_NAME = "config.json";
const CONFIG_PREFIX_KEY = "id_prefix";
const ID_WIDTH = 3;
const EMPTY_DIRECTORY_MARKER = ".gitkeep";
const ALLOWED_TRANSITIONS = {
  draft: ["active"],
  active: ["closed"],
  closed: [],
};

function fail(message) {
  throw new Error(message);
}

function getIssueRoot(projectRoot = process.cwd()) {
  return path.resolve(projectRoot, "docs/issues");
}

function hasEntry(filePath) {
  try {
    fs.lstatSync(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    fail(`${filePath} cannot be checked: ${error.message}`);
  }
}

function assertDirectory(directory) {
  let stats;
  try {
    stats = fs.lstatSync(directory);
  } catch (error) {
    fail(`${directory} is not an accessible directory: ${error.message}`);
  }
  if (stats.isSymbolicLink()) {
    fail(`${directory} must not be a symbolic link.`);
  }
  if (!stats.isDirectory()) {
    fail(`${directory} is not a directory.`);
  }
}

function validateIssueDirectories(issueRoot) {
  for (const status of STATUSES) {
    assertDirectory(path.join(issueRoot, status));
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validatePrefix(prefix) {
  if (typeof prefix !== "string" || !/^[A-Z][A-Z0-9]*$/.test(prefix)) {
    fail(`Issue prefix must contain only uppercase letters and digits and start with a letter: '${prefix}'.`);
  }
}

function createIssueConfig(prefix) {
  validatePrefix(prefix);
  const escapedPrefix = escapeRegExp(prefix);
  const idPattern = new RegExp(`^${escapedPrefix}-\\d{${ID_WIDTH}}$`);
  const filePattern = new RegExp(`^(${escapedPrefix}-\\d{${ID_WIDTH}})-.+\\.md$`);
  const dependenciesPattern = new RegExp(
    `^\\[(?:${escapedPrefix}-\\d{${ID_WIDTH}}(?:, ${escapedPrefix}-\\d{${ID_WIDTH}})*)?\\]$`,
  );

  return { prefix, idPattern, filePattern, dependenciesPattern };
}

function readIssueConfig(issueRoot) {
  const configPath = path.join(issueRoot, CONFIG_FILE_NAME);
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    fail(`Unable to read ${configPath}: ${error.message}`);
  }

  if (!config || typeof config !== "object" || Array.isArray(config)) {
    fail(`${configPath} must contain a JSON object.`);
  }
  if (Object.keys(config).length !== 1 || !(CONFIG_PREFIX_KEY in config)) {
    fail(`${configPath} must contain only '${CONFIG_PREFIX_KEY}'.`);
  }

  return createIssueConfig(config[CONFIG_PREFIX_KEY]);
}

function getRuntime(projectRoot) {
  const issueRoot = getIssueRoot(projectRoot);
  if (!hasEntry(issueRoot)) {
    fail(`${issueRoot} does not exist. Run 'issues init <PREFIX>' first.`);
  }
  assertDirectory(issueRoot);
  validateIssueDirectories(issueRoot);
  return { projectRoot, issueRoot, config: readIssueConfig(issueRoot) };
}

function parseFrontMatter(content, filePath) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail(`${filePath} has no valid front matter.`);
  }

  const fields = {};
  for (const line of match[1].split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      fail(`${filePath} has invalid front matter: ${line}`);
    }
    const key = line.slice(0, separatorIndex).trim();
    fields[key] = line.slice(separatorIndex + 1).trim();
  }
  return fields;
}

function parseTitle(content, filePath) {
  const match = content.match(/^# (.+)$/m);
  if (!match) {
    fail(`${filePath} has no level-one title.`);
  }
  return match[1];
}

function parseDependencies(value, filePath, config) {
  if (!config.dependenciesPattern.test(value || "")) {
    fail(`${filePath} has invalid depends_on '${value}'.`);
  }
  return value === "[]" ? [] : value.slice(1, -1).split(", ");
}

function getIssueFileNames(issueRoot, status, config) {
  const directory = path.join(issueRoot, status);
  assertDirectory(directory);
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const unexpectedEntries = entries.filter((entry) => {
    return !entry.isFile()
      || (entry.name !== EMPTY_DIRECTORY_MARKER && !config.filePattern.test(entry.name));
  });
  if (unexpectedEntries.length > 0) {
    fail(`${directory} contains unsupported entries: ${unexpectedEntries.map((entry) => entry.name).join(", ")}.`);
  }
  return entries
    .filter((entry) => entry.isFile() && config.filePattern.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function readIssueFile(issueRoot, status, fileName, config) {
  const id = fileName.match(config.filePattern)[1];
  const filePath = path.join(issueRoot, status, fileName);
  const content = fs.readFileSync(filePath, "utf8");
  const fields = parseFrontMatter(content, filePath);

  return {
    id,
    status,
    declaredId: fields.id,
    declaredStatus: fields.status,
    dependsOn: parseDependencies(fields.depends_on, filePath, config),
    title: parseTitle(content, filePath),
    fileName,
    filePath,
    content,
  };
}

function readIssueFiles(issueRoot, config) {
  const issues = [];
  for (const status of STATUSES) {
    const fileNames = getIssueFileNames(issueRoot, status, config);
    for (const fileName of fileNames) {
      issues.push(readIssueFile(issueRoot, status, fileName, config));
    }
  }
  return issues;
}

function validateIssueDeclarations(issues) {
  const seenIds = new Set();
  for (const issue of issues) {
    if (issue.declaredId !== issue.id) {
      fail(`${issue.filePath} has id '${issue.declaredId}', expected '${issue.id}'.`);
    }
    if (issue.declaredStatus !== issue.status) {
      fail(`${issue.filePath} has status '${issue.declaredStatus}', expected '${issue.status}'.`);
    }
    if (seenIds.has(issue.id)) {
      fail(`Issue id '${issue.id}' exists more than once.`);
    }
    seenIds.add(issue.id);
  }
  return seenIds;
}

function validateActiveIssueCount(issues) {
  const activeIssues = issues.filter((issue) => issue.status === "active");
  if (activeIssues.length > 1) {
    fail(`Only one active issue is allowed; found ${activeIssues.length}.`);
  }
}

function validateIssueDependencies(issues, seenIds) {
  for (const issue of issues) {
    for (const dependencyId of issue.dependsOn) {
      if (dependencyId === issue.id) {
        fail(`${issue.id} cannot depend on itself.`);
      }
      if (!seenIds.has(dependencyId)) {
        fail(`${issue.id} depends on missing issue '${dependencyId}'.`);
      }
    }
  }
}

function validateIssues(issues) {
  const seenIds = validateIssueDeclarations(issues);
  validateActiveIssueCount(issues);
  validateIssueDependencies(issues, seenIds);
}

function sortIssuesById(issues) {
  return issues.slice().sort((left, right) => left.id.localeCompare(right.id));
}

function readIssues(runtime) {
  const issues = readIssueFiles(runtime.issueRoot, runtime.config);
  validateIssues(issues);
  return sortIssuesById(issues);
}

function validateListTarget(target) {
  if (target && target !== "all" && !STATUSES.includes(target)) {
    fail(`Unknown list target '${target}'. Expected: all, ${STATUSES.join(", ")}.`);
  }
}

function getVisibleIssues(issues, target) {
  if (target === "all") {
    return issues;
  }
  if (target) {
    return issues.filter((issue) => issue.status === target);
  }
  return issues.filter((issue) => issue.status === "active" || issue.status === "draft");
}

function formatIssueTableRow(issue) {
  const dependencies = issue.dependsOn.length === 0 ? "-" : issue.dependsOn.join(", ");
  return `| ${issue.id} | ${issue.status} | ${issue.title} | ${dependencies} |`;
}

function printIssueTable(issues) {
  console.log("| ID | Status | Issue | Depends on |");
  console.log("| --- | --- | --- | --- |");
  for (const issue of issues) {
    console.log(formatIssueTableRow(issue));
  }
  console.log(`\n${issues.length} issue(s)`);
}

function printDefaultListSummary(issues) {
  const closedIssueCount = issues.filter((issue) => issue.status === "closed").length;
  console.log(`closed issue(s): ${closedIssueCount} (use 'list all' to show them)`);
}

function listIssues(runtime, target) {
  validateListTarget(target);
  const issues = readIssues(runtime);
  printIssueTable(getVisibleIssues(issues, target));
  if (!target) {
    printDefaultListSummary(issues);
  }
}

function countIssuesByStatus(issues, status) {
  return issues.filter((issue) => issue.status === status).length;
}

function summarizeIssues(runtime) {
  const issues = readIssues(runtime);
  const activeIssues = issues.filter((issue) => issue.status === "active");
  const activeSummary = activeIssues.length === 0 ? "0" : `1 (${activeIssues[0].id})`;

  console.log(`active: ${activeSummary}`);
  console.log(`draft: ${countIssuesByStatus(issues, "draft")}`);
  console.log(`closed: ${countIssuesByStatus(issues, "closed")}`);
}

function getReadyIssues(issues) {
  return issues.filter((issue) => {
    return issue.status === "draft" && getUnresolvedDependencies(issue, issues).length === 0;
  });
}

function listReadyIssues(runtime) {
  const issues = readIssues(runtime);
  printIssueTable(getReadyIssues(issues));
}

function formatIssuePath(issue, projectRoot) {
  return path.relative(projectRoot, issue.filePath);
}

function validateShowArguments(id, config) {
  if (!config.idPattern.test(id || "")) {
    fail(`Issue id must have the form ${config.prefix}-000.`);
  }
}

function findIssueById(issues, id) {
  const issue = issues.find((candidate) => candidate.id === id);
  if (!issue) {
    fail(`Issue '${id}' does not exist.`);
  }
  return issue;
}

function showIssue(runtime, id) {
  validateShowArguments(id, runtime.config);
  const issues = readIssues(runtime);
  const issue = findIssueById(issues, id);
  const dependencies = issue.dependsOn.length === 0 ? "-" : issue.dependsOn.join(", ");

  console.log(`ID: ${issue.id}`);
  console.log(`Status: ${issue.status}`);
  console.log(`Title: ${issue.title}`);
  console.log(`Depends on: ${dependencies}`);
  console.log(`Path: ${formatIssuePath(issue, runtime.projectRoot)}`);
  console.log("");
  console.log(issue.content);
}

function validateMoveArguments(id, targetStatus, config) {
  if (!config.idPattern.test(id || "")) {
    fail(`Issue id must have the form ${config.prefix}-000.`);
  }
  if (!STATUSES.includes(targetStatus)) {
    fail(`Unknown target status '${targetStatus}'. Expected: ${STATUSES.join(", ")}.`);
  }
}

function assertTransitionAllowed(issue, targetStatus) {
  if (!ALLOWED_TRANSITIONS[issue.status].includes(targetStatus)) {
    fail(`Transition '${issue.status}' -> '${targetStatus}' is not allowed.`);
  }
}

function assertNoOtherActiveIssue(issues) {
  if (issues.some((candidate) => candidate.status === "active")) {
    fail("Another issue is already active. Move it to closed first.");
  }
}

function getUnresolvedDependencies(issue, issues) {
  return issue.dependsOn.filter((dependencyId) => {
    return issues.find((candidate) => candidate.id === dependencyId).status !== "closed";
  });
}

function assertDependenciesResolved(issue, issues) {
  const unresolvedDependencies = getUnresolvedDependencies(issue, issues);
  if (unresolvedDependencies.length > 0) {
    fail(`Unresolved dependencies: ${unresolvedDependencies.join(", ")}.`);
  }
}

function assertAcceptanceCriteriaComplete(issue) {
  if (/- \[ \]/.test(issue.content)) {
    fail("All acceptance criteria must be checked before closing an issue.");
  }
}

function validateTransition(issue, targetStatus, issues) {
  assertTransitionAllowed(issue, targetStatus);
  if (targetStatus === "active" && issues.some((candidate) => candidate.status === "active")) {
    assertNoOtherActiveIssue(issues);
  }
  if (targetStatus === "active") {
    assertDependenciesResolved(issue, issues);
  }
  if (targetStatus === "closed") {
    assertAcceptanceCriteriaComplete(issue);
  }
}

function replaceIssueStatus(issue, targetStatus) {
  const statusLine = `status: ${issue.status}`;
  const updatedStatusLine = `status: ${targetStatus}`;
  const occurrences = issue.content.split(statusLine).length - 1;
  if (occurrences !== 1) {
    fail(`${issue.filePath} must contain exactly one '${statusLine}' line.`);
  }
  return issue.content.replace(statusLine, updatedStatusLine);
}

function getTargetIssuePath(runtime, issue, targetStatus) {
  const targetPath = path.join(runtime.issueRoot, targetStatus, issue.fileName);
  if (hasEntry(targetPath)) {
    fail(`${targetPath} already exists.`);
  }
  return targetPath;
}

function moveIssueFile(runtime, issue, targetStatus) {
  const targetPath = getTargetIssuePath(runtime, issue, targetStatus);
  const updatedContent = replaceIssueStatus(issue, targetStatus);
  let targetFileDescriptor = null;
  let targetCreated = false;

  try {
    targetFileDescriptor = fs.openSync(targetPath, "wx");
    targetCreated = true;
    fs.writeFileSync(targetFileDescriptor, updatedContent, "utf8");
    fs.closeSync(targetFileDescriptor);
    targetFileDescriptor = null;
    fs.unlinkSync(issue.filePath);
  } catch (error) {
    let closeError = null;
    let cleanupError = null;
    if (targetFileDescriptor !== null) {
      try {
        fs.closeSync(targetFileDescriptor);
      } catch (closeFailure) {
        closeError = closeFailure;
      }
    }
    if (targetCreated) {
      try {
        fs.unlinkSync(targetPath);
      } catch (cleanupFailure) {
        if (cleanupFailure.code !== "ENOENT") {
          cleanupError = cleanupFailure;
        }
      }
    }
    const recoveryDetails = [closeError, cleanupError]
      .filter(Boolean)
      .map((failure) => failure.message)
      .join("; ");
    fail(
      `Unable to move ${issue.id} to ${targetStatus}: ${error.message}`
        + (recoveryDetails ? ` Cleanup failed: ${recoveryDetails}.` : ""),
    );
  }
}

function moveIssue(runtime, id, targetStatus) {
  validateMoveArguments(id, targetStatus, runtime.config);
  const issues = readIssues(runtime);
  const issue = findIssueById(issues, id);

  validateTransition(issue, targetStatus, issues);
  moveIssueFile(runtime, issue, targetStatus);
  console.log(`${id}: ${issue.status} -> ${targetStatus}`);
}

function initIssueStore(prefix, projectRoot = process.cwd()) {
  const issueRoot = getIssueRoot(projectRoot);
  if (hasEntry(issueRoot)) {
    fail(`${issueRoot} already exists; refusing to overwrite an Issue store.`);
  }

  const config = createIssueConfig(prefix);
  const issueParent = path.dirname(issueRoot);
  if (hasEntry(issueParent)) {
    assertDirectory(issueParent);
  } else {
    fs.mkdirSync(issueParent, { recursive: true });
  }

  let temporaryRoot = null;
  try {
    temporaryRoot = fs.mkdtempSync(path.join(issueParent, ".manage-local-issues-init-"));
    for (const status of STATUSES) {
      fs.mkdirSync(path.join(temporaryRoot, status));
    }
    fs.writeFileSync(
      path.join(temporaryRoot, CONFIG_FILE_NAME),
      `${JSON.stringify({ [CONFIG_PREFIX_KEY]: config.prefix }, null, 2)}\n`,
      "utf8",
    );
    fs.renameSync(temporaryRoot, issueRoot);
    temporaryRoot = null;
  } catch (error) {
    if (temporaryRoot) {
      try {
        fs.rmSync(temporaryRoot, { recursive: true, force: true });
      } catch (cleanupFailure) {
        fail(`Unable to initialize ${issueRoot}: ${error.message} Cleanup failed: ${cleanupFailure.message}.`);
      }
    }
    fail(`Unable to initialize ${issueRoot}: ${error.message}`);
  }
  console.log(`Initialized Issue store at ${path.relative(process.cwd(), issueRoot)} with prefix ${config.prefix}.`);
}

function printUsage() {
  console.log(`Usage:
  node .agents/skills/manage-local-issues/scripts/issues.js init <PREFIX>
  node .agents/skills/manage-local-issues/scripts/issues.js list [all|draft|active|closed]
  node .agents/skills/manage-local-issues/scripts/issues.js summary
  node .agents/skills/manage-local-issues/scripts/issues.js ready
  node .agents/skills/manage-local-issues/scripts/issues.js show <PREFIX-000>
  node .agents/skills/manage-local-issues/scripts/issues.js move <PREFIX-000> <next-status>
  allowed move transitions: draft -> active; active -> closed`);
}

function rejectInvalidArguments(command) {
  printUsage();
  fail(`Invalid arguments for '${command}'.`);
}

function dispatchCommand(command, args, projectRoot = process.cwd()) {
  if (command === "init" && args.length === 1) {
    initIssueStore(args[0], projectRoot);
    return 0;
  }

  const runtime = getRuntime(projectRoot);
  if (command === "list" && args.length <= 1) {
    listIssues(runtime, args[0]);
    return 0;
  }
  if (command === "summary" && args.length === 0) {
    summarizeIssues(runtime);
    return 0;
  }
  if (command === "ready" && args.length === 0) {
    listReadyIssues(runtime);
    return 0;
  }
  if (command === "show" && args.length === 1) {
    showIssue(runtime, args[0]);
    return 0;
  }
  if (command === "move" && args.length === 2) {
    moveIssue(runtime, args[0], args[1]);
    return 0;
  }
  if (command) {
    rejectInvalidArguments(command);
  }

  printUsage();
  return 0;
}

if (require.main === module) {
  const [, , command, ...args] = process.argv;
  try {
    const exitCode = dispatchCommand(command, args);
    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  dispatchCommand,
  getIssueRoot,
  initIssueStore,
};
