import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

const terminal = createInterface({ input: process.stdin, output: process.stdout, terminal: Boolean(process.stdin.isTTY) });
let secretMode = false;
const write = terminal._writeToOutput.bind(terminal);
terminal._writeToOutput = (value) => { if (!secretMode) write(value); };
process.stdout.write("New admin password (at least 12 characters; input is hidden): ");
secretMode = true;
terminal.question("", (password) => {
  terminal.close();
  process.stdout.write("\n");
  if (password.length < 12 || password.length > 256) { process.stderr.write("Use a password between 12 and 256 characters.\n"); process.exitCode = 1; return; }
  const salt = randomBytes(32).toString("hex");
  process.stdout.write(`ADMIN_PASSWORD_HASH=scrypt:${salt}:${scryptSync(password,salt,64).toString("hex")}\n`);
  process.stdout.write(`SESSION_SECRET=${randomBytes(48).toString("base64url")}\n`);
});
