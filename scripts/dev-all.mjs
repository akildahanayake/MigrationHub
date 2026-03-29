import { spawn } from "node:child_process";

function start(name, commandLine) {
  const child = spawn(commandLine, {
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (err) => {
    console.error(`[${name}] failed to start: ${err.message}`);
  });

  return child;
}

const backend = start("backend", "php -S localhost:8000 -t backend");
const frontend = start("frontend", "npm run dev");

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (!backend.killed) backend.kill();
  if (!frontend.killed) frontend.kill();

  setTimeout(() => process.exit(code), 200);
}

backend.on("exit", (code) => {
  console.log(`[backend] exited with code ${code ?? 0}`);
  shutdown(code ?? 0);
});

frontend.on("exit", (code) => {
  console.log(`[frontend] exited with code ${code ?? 0}`);
  shutdown(code ?? 0);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
