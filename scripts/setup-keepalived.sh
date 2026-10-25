#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=================================="
echo " Setup Keepalived"
echo "=================================="

setup_keepalived() {
    VM="$1"
    CONFIG="$2"

    echo ""
    echo "Setting up $VM..."

    vagrant ssh "$VM" -c \
        "sudo apt-get update &&
         sudo apt-get install -y keepalived &&
         sudo install -D -o root -g root -m 644 \
             /vagrant/$CONFIG /etc/keepalived/keepalived.conf &&
         sudo systemctl enable keepalived &&
         sudo systemctl restart keepalived &&
         sudo systemctl is-active keepalived"

    echo "$VM setup completed."
}

setup_keepalived "lb-01" "keepalived/keepalived-lb-01.conf"
setup_keepalived "lb-02" "keepalived/keepalived-lb-02.conf"

echo ""
echo "=================================="
echo " Keepalived setup completed!"
echo "=================================="
