
const express = require("express");
const cors = require("cors");
const { execFile } = require("node:child_process");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const SERVERS = [
  {
    name: "LB-01",
    ip: "192.168.56.10",
    url: "http://192.168.56.10",
    role: "Load Balancer",
  },
  {
    name: "LB-02",
    ip: "192.168.56.11",
    url: "http://192.168.56.11",
    role: "Load Balancer",
  },
  {
    name: "WEB-01",
    ip: "192.168.56.20",
    url: "http://192.168.56.20:3000",
    role: "Web Server",
  },
  {
    name: "WEB-02",
    ip: "192.168.56.21",
    url: "http://192.168.56.21:3000",
    role: "Web Server",
  },
];

const VIP = "192.168.56.100";
const VIP_URL = `http://${VIP}`;

function checkUrl(url) {
  return new Promise(async (resolve) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const started = Date.now();

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      });

      resolve({
        status: response.ok ? "UP" : "DOWN",
        httpStatus: response.status,
        responseTimeMs: Date.now() - started,
      });
    } catch {
      resolve({
        status: "DOWN",
        httpStatus: null,
        responseTimeMs: Date.now() - started,
      });
    } finally {
      clearTimeout(timer);
    }
  });
}

// Run commands from the directory containing the Vagrantfile.
function getVipOwner(vmName) {
  return new Promise((resolve) => {
    execFile(
      "vagrant",
      [
        "ssh",
        vmName,
        "-c",
        `ip -4 -o addr show | grep -F '${VIP}/'`,
      ],
      { timeout: 5000 },
      (error, stdout) => {
        if (error) {
          resolve(false);
          return;
        }

        resolve(stdout.includes(`${VIP}/`));
      }
    );
  });
}

async function detectActiveLoadBalancer() {
  const [lb01OwnsVip, lb02OwnsVip] = await Promise.all([
    getVipOwner("lb-01"),
    getVipOwner("lb-02"),
  ]);

  if (lb01OwnsVip && !lb02OwnsVip) return "LB-01";
  if (lb02OwnsVip && !lb01OwnsVip) return "LB-02";

  return "UNKNOWN";
}

app.get("/", (_req, res) => {
  res.json({
    message: "HA React Monitoring API is running",
    health: "/api/health",
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    const checkedAt = new Date().toISOString();

    const [serverResults, vipResult, activeLoadBalancer] =
      await Promise.all([
        Promise.all(
          SERVERS.map(async (server) => {
            const result = await checkUrl(server.url);

            return {
              ...server,
              ...result,
            };
          })
        ),
        checkUrl(VIP_URL),
        detectActiveLoadBalancer(),
      ]);

    const servers = serverResults.map((server) => ({
      ...server,
      isActive: server.name === activeLoadBalancer,
    }));

    res.json({
      checkedAt,
      activeLoadBalancer,
      servers,
      vip: {
        ip: VIP,
        url: VIP_URL,
        status: vipResult.status,
        httpStatus: vipResult.httpStatus,
        responseTimeMs: vipResult.responseTimeMs,
        activeLoadBalancer,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Unable to check infrastructure health",
      message: error.message,
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Monitoring API: http://localhost:${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
});
