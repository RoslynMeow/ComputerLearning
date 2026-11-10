import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";

const execFileAsync = promisify(execFile);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = resolve(repoRoot, "content");
const buildContentScript = resolve(repoRoot, "scripts/build-web-content.mjs");
const validateScript = resolve(repoRoot, "scripts/validate-content.mjs");

function contentWatcher(): Plugin {
  let running = false;
  let pending = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function rebuild(server: ViteDevServer) {
    if (running) {
      pending = true;
      return;
    }
    running = true;
    try {
      try {
        await execFileAsync(process.execPath, [validateScript], {
          cwd: repoRoot,
          env: process.env,
        });
      } catch (error) {
        server.config.logger.warn(
          `[content] validate failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      await execFileAsync(process.execPath, [buildContentScript], {
        cwd: repoRoot,
        env: process.env,
      });
      server.ws.send({ type: "full-reload" });
      server.config.logger.info("[content] rebuilt");
    } catch (error) {
      server.config.logger.error(
        `[content] rebuild failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      running = false;
      if (pending) {
        pending = false;
        void rebuild(server);
      }
    }
  }

  return {
    name: "watch-content",
    configureServer(server) {
      server.watcher.add(contentDir);
      const onChange = (file: string) => {
        const normalized = resolve(file).toLowerCase();
        if (!normalized.startsWith(contentDir.toLowerCase())) return;
        if (!/\.(typ|yml)$/.test(normalized)) return;
        clearTimeout(timer);
        timer = setTimeout(() => void rebuild(server), 300);
      };
      server.watcher.on("add", onChange);
      server.watcher.on("change", onChange);
      server.watcher.on("unlink", onChange);
    },
  };
}

export default defineConfig({
  plugins: [react(), contentWatcher()],
});
