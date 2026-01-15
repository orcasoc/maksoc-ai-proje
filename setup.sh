#!/bin/bash

# LangChain MCP Gateway Setup Script for Ubuntu
# Usage: sudo ./setup.sh

set -e

echo "Starting setup for LangChain MCP Gateway..."

# 1. Check prerequisites
if ! command -v docker &> /dev/null; then
    echo "Docker could not be found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose could not be found. Please install docker-compose first."
    exit 1
fi

# 2. System Configuration for Elasticsearch/OpenSearch (Wazuh/Shuffle)
echo "Configuring vm.max_map_count for OpenSearch/Elasticsearch..."
sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | tee -a /etc/sysctl.conf

# 3. Create Docker Volumes directories (if bind mounting, but we use named volumes in compose)
# If you want to persist data in specific host paths, create them here:
# mkdir -p /opt/mcp-gateway/wazuh-data
# chmod -R 755 /opt/mcp-gateway/wazuh-data

# 4. Generate Secrets if not present (Simple example)
if grep -q "super_secret_jwt_key_change_me" .env; then
    echo "WARNING: Default JWT Secret found in .env. Please change it."
    # sed -i "s/super_secret_jwt_key_change_me/$(openssl rand -hex 32)/g" .env
fi

# 5. Build and Start
echo "Building and starting Docker Containers..."
docker-compose up -d --build

echo "Setup Complete!"
echo "Gateway is running on http://localhost:8080"
echo "Wazuh Dashboard: https://localhost:8443"
echo "Shuffle Frontend: https://localhost:3443"
echo "DFIR IRIS: http://localhost:8080 (Mapped port)"
