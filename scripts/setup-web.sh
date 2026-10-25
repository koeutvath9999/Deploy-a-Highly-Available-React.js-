#!/bin/bash

set -e

echo "=================================="
echo " Setup React Web Servers"
echo "=================================="

setup_web() {
    VM="$1"
    BUILD_DIR="$2"

    echo ""
    echo "Setting up $VM..."

    vagrant ssh "$VM" -c "sudo mkdir -p /opt/reactapp/dist &&
        sudo cp -a /vagrant/react-app/$BUILD_DIR/. /opt/reactapp/dist/ &&
        sudo cp /vagrant/react-app/public/health.txt /opt/reactapp/dist/health.txt &&
        sudo cp /vagrant/systemd/react-app.service /etc/systemd/system/react-app.service &&
        sudo chown -R reactapp:reactapp /opt/reactapp &&
        sudo systemctl daemon-reload &&
        sudo systemctl enable react-app &&
        sudo systemctl restart react-app &&
        sudo systemctl is-active react-app"

    echo "$VM setup completed."
}

setup_web "web-01" "dist-web-01"
setup_web "web-02" "dist-web-02"

echo ""
echo "=================================="
echo " Web server setup completed!"
echo "=================================="
