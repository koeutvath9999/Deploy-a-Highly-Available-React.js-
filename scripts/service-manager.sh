#!/bin/bash

# Manage services on the HA React infrastructure

ACTION="$1"
VM="$2"

if [[ -z "$ACTION" || -z "$VM" ]]; then
    echo "Usage: ./scripts/service-manager.sh <action> <vm>"
    echo "Actions: start, stop, restart, status"
    echo "VMs: web-01, web-02, lb-01, lb-02"
    exit 1
fi

case "$ACTION" in
    start|stop|restart|status)
        ;;
    *)
        echo "Error: Invalid action '$ACTION'"
        echo "Use: start, stop, restart, or status"
        exit 1
        ;;
esac

case "$VM" in
    web-01|web-02)
        SERVICE="react-app"
        ;;
    lb-01|lb-02)
        SERVICE="haproxy"
        ;;
    *)
        echo "Error: Invalid VM '$VM'"
        echo "Use: web-01, web-02, lb-01, or lb-02"
        exit 1
        ;;
esac

echo "=================================="
echo " Action: $ACTION"
echo " VM: $VM"
echo " Service: $SERVICE"
echo "=================================="

if [[ "$ACTION" == "status" ]]; then
    vagrant ssh "$VM" -c "sudo systemctl status --no-pager $SERVICE"
else
    vagrant ssh "$VM" -c "sudo systemctl $ACTION $SERVICE"
fi
