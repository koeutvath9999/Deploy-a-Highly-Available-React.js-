
# HA React Infrastructure

Linux System Administration & DevOps Homework

## 1. Project Overview

This project deploys a React + Vite application on two web servers
behind two HAProxy load balancers. Keepalived manages a Virtual IP (VIP)
for high availability.

## 2. Infrastructure

| Server | IP Address | Main Service |
|---|---|---|
| LB-01 |   | HAProxy + Keepalived |
| LB-02 | 192.168.56.11 | HAProxy + Keepalived |
| WEB-01 | 192.168.56.20 | React + Vite |
| WEB-02 | 192.168.56.21 | React + Vite |
| VIP | 192.168.56.100 | Shared virtual IP |
        
## 3. Architecture

Browser
   |
   v
LB-01 / LB-02
   |
   v
WEB-01 / WEB-02

Keepalived manages the VIP between the two load balancers.

## 4. Browser Testing

- WEB-01: http://192.168.56.20:3000
- WEB-02: http://192.168.56.21:3000
- LB-01: http://192.168.56.10
- LB-02: http://192.168.56.11
- VIP: http://192.168.56.100

Health-check endpoints:

- http://192.168.56.20:3000/health.txt
- http://192.168.56.21:3000/health.txt

Expected health-check response: OK

## 5. Scripts

Run these commands from the project root:

```bash
./scripts/check-health.sh
./scripts/server-report.sh
./scripts/service-manager.sh status web-01
./scripts/service-manager.sh status web-02
./scripts/service-manager.sh status lb-01
./scripts/service-manager.sh status lb-02
```

Deployment and setup scripts:

```bash
./scripts/deploy-react.sh
./scripts/setup-web.sh
./scripts/setup-lb.sh
./scripts/setup-keepalived.sh
```

## 6. Failover Test

1. Confirm LB-01 currently owns the VIP.
2. Stop Keepalived on LB-01.
3. Verify that LB-02 takes over the VIP.
4. Test HTTP access through the VIP.
5. Restart Keepalived on LB-01.
6. Verify the VIP owner again.

## 7. Expected Results

- Both React web servers respond to requests.
- Both HAProxy services are active.
- The VIP responds through the active load balancer.
- LB-02 can take over the VIP when LB-01's Keepalived service stops.

Record actual test results before marking each requirement complete.
