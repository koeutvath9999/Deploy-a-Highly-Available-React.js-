#!/bin/bash

set -e

echo "=================================="
echo " Deploy React to Web Servers"
echo "=================================="

echo "Deploying to WEB-01..."
vagrant ssh web-01 -c "sudo cp -a /vagrant/react-app/dist-web-01/. /opt/reactapp/dist/"
echo "WEB-01 deployment complete."

echo "Deploying to WEB-02..."
vagrant ssh web-02 -c "sudo cp -a /vagrant/react-app/dist-web-02/. /opt/reactapp/dist/"
echo "WEB-02 deployment complete."

echo "=================================="
echo " Deployment completed!"
echo "=================================="
