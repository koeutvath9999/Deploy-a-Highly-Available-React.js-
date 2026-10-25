
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/health";

const REFRESH_MS = 3000;

const INFRASTRUCTURE = [
  { name: "LB-01", ip: "192.168.56.10", role: "Load Balancer" },
  { name: "LB-02", ip: "192.168.56.11", role: "Load Balancer" },
  { name: "WEB-01", ip: "192.168.56.20", role: "Web Server" },
  { name: "WEB-02", ip: "192.168.56.21", role: "Web Server" },
];

function makeRequestId() {
  return Math.random().toString(16).slice(2, 10);
}

function formatTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function App() {
  const [rows, setRows] = useState([]);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    let active = true;
    let timer;

    async function checkHealth() {
      const start = performance.now();
      const timestamp = new Date().toISOString();

      try {
        const response = await fetch(API_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!active) return;

        setHealth(data);
        setError("");

        const servers = data.servers || [];

        const activeLB =
          data.activeLoadBalancer ||
          data.vip?.activeLoadBalancer ||
          "UNKNOWN";

        const backend = servers.find(
          (server) =>
            server.name.startsWith("WEB") &&
            server.status === "UP"
        );

        const vipOnline = data.vip?.status === "UP";

        const row = {
          id: makeRequestId(),
          time: timestamp,
          loadBalancer: activeLB,
          backend: backend?.name || "—",
          latency:
            data.vip?.responseTimeMs ??
            Math.round(performance.now() - start),
          result: vipOnline && backend ? "OK" : "FAILED",
        };

        setRows((previous) => [row, ...previous].slice(0, 50));
      } catch (err) {
        if (!active) return;

        setError(err.message || "API connection failed");

        setRows((previous) =>
          [
            {
              id: makeRequestId(),
              time: timestamp,
              loadBalancer: "—",
              backend: "—",
              latency: Math.round(performance.now() - start),
              result: "FAILED",
            },
            ...previous,
          ].slice(0, 50)
        );
      } finally {
        if (active) {
          timer = setTimeout(checkHealth, REFRESH_MS);
        }
      }
    }

    checkHealth();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [paused]);

  const successfulSamples = useMemo(
    () => rows.filter((row) => row.result === "OK").length,
    [rows]
  );

  const activeLoadBalancer =
    health?.activeLoadBalancer ||
    health?.vip?.activeLoadBalancer ||
    "UNKNOWN";

  const lastChecked = health?.checkedAt
    ? formatTime(health.checkedAt)
    : "Waiting for first sample";

  const servers = health?.servers || [];

  function getServerStatus(name) {
    return (
      servers.find((server) => server.name === name)?.status ||
      "UNKNOWN"
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard-heading">
        <div>
          <h1>HA Control Dashboard</h1>
          <p>High Availability Infrastructure Monitoring</p>
        </div>

        <span
          className={`connection-status ${
            error ? "offline" : ""
          }`}
        >
          {error
            ? "API Disconnected"
            : health
              ? "Monitoring Online"
              : "Connecting..."}
        </span>
      </header>

      <section className="vip-panel">
        <div>
          <span className="infra-label">VIRTUAL IP (VIP)</span>
          <h2>192.168.56.100:80</h2>
          <p>Keepalived · High Availability</p>
          <span
            className={`server-badge ${
              health?.vip?.status?.toLowerCase() || "unknown"
            }`}
          >
            VIP: {health?.vip?.status || "UNKNOWN"}
          </span>
        </div>

        <div className="vip-active">
          <span className="infra-label">ACTIVE LOAD BALANCER</span>
          <strong>
            {activeLoadBalancer === "UNKNOWN"
              ? "Detecting..."
              : activeLoadBalancer}
          </strong>
        </div>
      </section>

      <section className="infrastructure-section">
        <h2>Load Balancers</h2>

        <div className="infrastructure-grid">
          {INFRASTRUCTURE.filter((server) =>
            server.name.startsWith("LB")
          ).map((server) => {
            const status = getServerStatus(server.name);
            const isActive = activeLoadBalancer === server.name;

            return (
              <article
                key={server.name}
                className={`infrastructure-card ${
                  isActive ? "active-lb" : ""
                }`}
              >
                <div className="infra-card-top">
                  <span className="infra-icon">⇄</span>
                  <span
                    className={`server-badge ${status.toLowerCase()}`}
                  >
                    {status}
                  </span>
                </div>

                <h3>{server.name}</h3>
                <p>{server.ip}</p>
                <span className="infra-role">{server.role}</span>

                <div
                  className={`lb-state ${
                    isActive ? "is-active" : ""
                  }`}
                >
                  {isActive
                    ? "ACTIVE · VIP OWNER"
                    : status === "UP"
                      ? "STANDBY / AVAILABLE"
                      : "NOT AVAILABLE"}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="infrastructure-section">
        <h2>Backend Web Servers</h2>

        <div className="infrastructure-grid">
          {INFRASTRUCTURE.filter((server) =>
            server.name.startsWith("WEB")
          ).map((server) => {
            const status = getServerStatus(server.name);

            return (
              <article
                key={server.name}
                className="infrastructure-card"
              >
                <div className="infra-card-top">
                  <span className="infra-icon">▣</span>
                  <span
                    className={`server-badge ${status.toLowerCase()}`}
                  >
                    {status}
                  </span>
                </div>

                <h3>{server.name}</h3>
                <p>{server.ip}:3000</p>
                <span className="infra-role">{server.role}</span>
              </article>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="error-message">
          <strong>Monitoring API unavailable</strong>
          <p>{error}</p>
          <small>Make sure your API is running on port 4000.</small>
        </div>
      )}

      <section className="requests-panel">
        <header className="panel-header">
          <div>
            <h2>Recent requests</h2>
            <p>Live diagnostic history in this browser session.</p>
          </div>

          <div className="header-actions">
            <span className="sample-count">
              {successfulSamples} successful samples
            </span>

            <button
              className="pause-button"
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? "Resume" : "Pause"}
            </button>
          </div>
        </header>

        <div className="summary">
          <div>
            <span>VIRTUAL IP</span>
            <strong>192.168.56.100:80</strong>
          </div>

          <div>
            <span>REFRESH INTERVAL</span>
            <strong>3 seconds</strong>
          </div>

          <div>
            <span>LAST CHECK</span>
            <strong>{lastChecked}</strong>
          </div>

          <div>
            <span>SAMPLES</span>
            <strong>{rows.length}</strong>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Load balancer</th>
                <th>Backend</th>
                <th>Latency</th>
                <th>Result</th>
                <th>Request ID</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Waiting for the first health-check sample...
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.time}-${row.id}`}>
                    <td>{formatTime(row.time)}</td>
                    <td>{row.loadBalancer}</td>
                    <td>{row.backend}</td>
                    <td>{row.latency} ms</td>
                    <td>
                      <span
                        className={`result-badge ${row.result.toLowerCase()}`}
                      >
                        {row.result}
                      </span>
                    </td>
                    <td className="request-id">{row.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="panel-footer">
          <span>
            <i className={`live-dot ${paused ? "paused" : ""}`} />
            {paused
              ? "Monitoring paused"
              : "Live monitoring active"}
          </span>

          <span>History is stored for this browser session.</span>
        </footer>
      </section>

      <p className="note">
        These rows represent periodic health-check samples. The backend
        column shows a healthy web server, not necessarily the exact
        backend that served a particular request.
      </p>
    </main>
  );
}
