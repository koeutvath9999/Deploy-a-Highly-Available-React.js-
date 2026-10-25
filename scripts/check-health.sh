#!/bin/bash

# Check the health of both React web servers and load balancers

echo "=================================="
echo " HA React Infrastructure Health"
echo "=================================="

check_server() {
    NAME="$1"
    URL="$2"

    printf "Checking %s ... " "$NAME"

    if curl -fsS --max-time 5 "$URL" > /dev/null; then
        echo "ONLINE"
    else
        echo "OFFLINE"
    fi
}

# React web servers: use the health-check file
check_server "WEB-01" "http://192.168.56.20:3000/health.txt"
check_server "WEB-02" "http://192.168.56.21:3000/health.txt"

# Load balancers
check_server "LB-01" "http://192.168.56.10"
check_server "LB-02" "http://192.168.56.11"

# Virtual IP (VIP), once Keepalived is configured
check_server "VIP" "http://192.168.56.100"

echo "=================================="
echo " Health check completed"
echo "=================================="
