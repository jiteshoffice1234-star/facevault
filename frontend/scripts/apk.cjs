// Cross-platform Gradle build runner for the Capacitor Android app.
// Usage: node scripts/apk.cjs [assembleDebug|assembleRelease]
//
// Invokes the Gradle wrapper MAIN CLASS directly with java -classpath, which
// avoids every Windows shell pitfall (cmd.exe path resolution, .bat line
// endings, NoDefaultCurrentDirectoryInExePath) and works identically on
// macOS/Linux CI. Requires a JDK: `java` on PATH or JAVA_HOME set.
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const variant = process.argv[2] || 'assembleDebug'
const androidDir = path.join(__dirname, '..', 'android')
const wrapperJar = path.join(androidDir, 'gradle', 'wrapper', 'gradle-wrapper.jar')

const result = spawnSync(
  'java',
  ['-classpath', wrapperJar, 'org.gradle.wrapper.GradleWrapperMain', variant],
  { cwd: androidDir, stdio: 'inherit' },
)

if (result.error) {
  console.error('\nCould not run Gradle: Java was not found on PATH.')
  console.error('Install a JDK (17+) or set JAVA_HOME, then retry.')
  console.error('Android Studio ships with a JDK; add it to PATH or export JAVA_HOME.')
  process.exit(1)
}
process.exit(result.status ?? 1)
