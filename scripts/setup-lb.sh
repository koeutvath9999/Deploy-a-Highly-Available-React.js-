#!/bin/bash

set -e

# Find the homework project root
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

CONFIG="haproxy/haproxy.cfg"

if [[ ! -f "$CONFIG" ]]; then
    echo "Error: $CONFIG not found."
    exit 1
fi

echo "=================================="
echo " Setup HAProxy Load Balancers"
echo "=================================="

setup_lb() {
    VM="$1"

    echo ""
    echo "Setting up $VM..."

    # Validate the shared configuration before installing it
    vagrant ssh "$VM" -c \
        "sudo haproxy -c -f /vagrant/$CONFIG"

    # Install, validate, enable, and restart HAProxy
    vagrant ssh "$VM" -c \
        "sudo install -o root -g root -m 644 /vagrant/$CONFIG /etc/haproxy/haproxy.cfg &&
         sudo haproxy -c -f /etc/haproxy/haproxy.cfg &&
         sudo systemctl enable haproxy &&
         sudo systemctl restart haproxy &&
         sudo systemctl is-active haproxy"

    echo "$VM setup completed."
}

setup_lb "lb-01"
setup_lb "lb-02"

echo ""
echo "=================================="
echo " Load balancer setup completed!"
echo "=================================="
