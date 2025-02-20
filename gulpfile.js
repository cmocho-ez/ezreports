import fs from "node:fs/promises";
import gulp from "gulp";
import { Bumper } from "conventional-recommended-bump";
import { execa } from "execa";
import uglify from "gulp-uglify";
import replace from "gulp-replace";

const preset = "express";
const stdio = "inherit";

/**
 * Asynchronously compiles SCSS files to CSS.
 *
 * This function uses the `npx sass` command to compile SCSS files located in the `src/scss` directory
 * and outputs the resulting CSS files to the `src/web/public/css` directory.
 *
 * @returns {Promise<void>} A promise that resolves when the SCSS compilation is complete.
 */
async function compileSCSS() {
  process.stdout.write("\n\t📝  Compiling SCSS files...\n");
  await execa("npm", ["run", "compile-sass"], { stdio });
}

/**
 * Bumps the package version based on conventional commits history.
 * @async
 * @throws {Error} If npm version command fails
 * @returns {Promise<void>}
 */
async function bumpVersion() {
  const bumper = new Bumper(process.cwd()).loadPreset(preset);
  const { releaseType } = await bumper.bump();

  process.stdout.write(`\n\t ⬆️  Bumping ${releaseType} version...`);
  await execa("npm", ["version", releaseType, "--no-git-tag-version"], {
    stdio,
  });
}

/**
 * Generates a CHANGELOG.md file using conventional commits.
 * @async
 * @throws {Error} If changelog generation fails
 * @returns {Promise<void>}
 */
async function generateChangeLog() {
  process.stdout.write("\n\t📄  Generating changelog...\n");
  await execa("npx", ["conventional-changelog", "--preset", preset, "--infile", "CHANGELOG.md", "--same-file"], {
    stdio,
  });
}

/**
 * Commits changes, creates a version tag, and pushes to remote.
 * @async
 * @throws {Error} If any git operation fails
 * @returns {Promise<void>}
 */
async function commitTagPush() {
  process.stdout.write("\n\t⚙️   Committing, tagging, and pushing...\n");

  const { version } = JSON.parse(await fs.readFile("package.json"));
  const commitMsg = `chore: release ${version}`;
  await execa("git", ["add", "."], { stdio });
  await execa("git", ["commit", "--message", commitMsg], { stdio });
  await execa("git", ["tag", `v${version}`], { stdio });
  await execa("git", ["push", "--follow-tags"], { stdio });
}

/**
 * Removes all contents from the dist directory.
 * @returns {NodeJS.ReadWriteStream} Gulp stream
 */
async function cleanDist() {
  process.stdout.write("\n\t🗑️   Cleaning destination folder...\n");

  try {
    await execa("cmd", ["/c", "rd /s /q ..\\dist"], { stdio });
  } catch (error) {
    return true;
  }
}

/**
 * Minifies JavaScript files from src/web/public directory.
 * @returns {NodeJS.ReadWriteStream} Gulp stream containing uglified files
 */
function uglifyPublicJs() {
  process.stdout.write("\n\t🔐  Obfuscating/minifying JS files...\n");

  return gulp.src("web/public/scripts/**/*.js").pipe(uglify()).pipe(gulp.dest("../dist/web/public/scripts"));
}

/**
 * Copies source files to dist directory with specified exclusions.
 * Includes .env file and all source files except:
 * - scss directory
 * - node_modules
 * - web/public/*.js (handled by uglifyPublicJs)
 * @returns {NodeJS.ReadWriteStream} Gulp stream
 */
function copyFiles() {
  return gulp
    .src(
      [
        ".env",
        "./**/*",
        "!gulp*.*",
        "!./scss/**",
        "!./node_modules/**",
        "!./web/www/scripts/**/*.js", // handled by uglifyPublicJs
      ],
      { encoding: false }
    )
    .pipe(replace("development", "production"))
    .pipe(gulp.dest("../dist"));
}

/**
 * Transfers built files to a remote server via SSH.
 * @param {string} env - Target environment ('dev', 'staging', 'prod')
 * @returns {Function} Gulp task function that performs the transfer
 * @throws {Error} If SSH operations fail
 * @example
 * transferFiles('prod')()
 */
function transferFiles(env) {
  return async () => {
    process.stdout.write(`\n\t🚀  Transferring app to ${env.toUpperCase()} server...\n`);

    const url = "root@ezsystems.net";
    const dest = "/var/www/apps/ezreports";

    /* SSH operations:
    - ssh into the server (using existing key)
    - make sure the destination folder exists
    - make sure the destination folder is empty
    - copy the files
    - make the dest folder the current one
    - install node dependencies
  */
    await execa("ssh", [url, `mkdir -p ${dest}`], { stdio });
    await execa("ssh", [url, `rm -rf ${dest}/*`], { stdio });
    await execa("scp", ["-rp", "../dist/.", `${url}:${dest}`], { stdio });

    process.stdout.write("\n\t📦  Installing dependencies...\n");

    await execa("ssh", [url, `cd ${dest} && npm install --omit=dev`], { stdio });
  };
}

function finished() {
  process.stdout.write("\n\t🎉  Finished successfully!\n\n");
}

/**
 * Builds and publishes the frontend:
 * 1. Cleans dist directory
 * 2. Processes files (copy & uglify) in parallel
 * 3. Transfers to test environment
 * @param {Function} cb - Gulp callback
 * @returns {NodeJS.ReadWriteStream} Combined gulp stream
 */
export function publish(cb) {
  process.stdout.write("\n\t🛠️   Publishing app...\n");
  return gulp.series(
    cleanDist,
    compileSCSS,
    gulp.parallel(copyFiles, uglifyPublicJs),
    transferFiles("TEST"),
    finished
  )(cb);
}

/**
 * Task to update frontend (alias for publish)
 * @type {import('gulp').TaskFunction}
 */
export const update = gulp.series(publish);

/**
 * Complete release workflow:
 * 1. Version bump
 * 2. Changelog generation
 * 3. Git operations
 * 4. Frontend publish
 * @type {import('gulp').TaskFunction}
 */
export const release = gulp.series(bumpVersion, generateChangeLog, commitTagPush, publish);
