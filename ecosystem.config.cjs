// PM2 process file. Requirement: hard restart every 3 hours with NO data loss —
// graceful shutdown (activity flush, AI writes, WAL checkpoint) is implemented in
// src/bootstrap/shutdown.ts and reacts to SIGINT/SIGTERM and the PM2 stop signal.
module.exports = {
  apps: [
    {
      name: "rpg-multibot",
      script: "dist/main.js",
      cwd: ".",
      instances: 1, // single-instance lock also enforced in code (data/locks)
      exec_mode: "fork",

      // --- 3-hour restart cycle ---
      cron_restart: "0 */3 * * *",

      // --- resilience ---
      autorestart: true,
      exp_backoff_restart_delay: 200, // exponential backoff base (ms) on crash loops
      max_restarts: 50,
      min_uptime: "20s",
      restart_delay: 3000,

      // give the graceful-shutdown handler time (it caps itself at ~20s)
      kill_timeout: 30000,
      wait_ready: false,
      listen_timeout: 20000,

      // --- logging (pino writes structured logs to data/logs; PM2 keeps stdout too) ---
      merge_logs: true,
      time: true,
      out_file: "./data/logs/pm2-out.log",
      error_file: "./data/logs/pm2-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      env_production: { NODE_ENV: "production" },
      env_development: { NODE_ENV: "development" },

      // watchdog memory guard: >600MB restarts the process (leak safety net)
      max_memory_restart: "600M",
    },
  ],
};
