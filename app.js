/**
 * Entry point for cPanel Node.js Application
 * This file is required by cPanel's Node.js selector
 */

import("./dist/index.js").catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
