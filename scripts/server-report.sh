#!/bin/bash

echo "=================================="
echo " HA React Server Report"
echo "=================================="

echo ""
echo "=== Vagrant VM Status ==="
vagrant status

report_server() {
    VM="$1"
    SERVICE="$2"

    echo ""
    echo "=== $VM ==="

    vagrant ssh "$VM" -c "
        printf 'Hostname: '
        hostname

        printf 'IP addresses: '
        hostname -I

        printf 'Service ($SERVICE): '
        systemctl is-active $SERVICE || true
    "
}

report_server "web-01" "react-app"
report_server "web-02" "react-app"
report_server "lb-01" "haproxy"
report_server "lb-02" "haproxy"

echo ""
echo "=================================="
echo " Server report completed"
echo "=================================="
