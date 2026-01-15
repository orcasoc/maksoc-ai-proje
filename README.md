# LangChain MCP Gateway Integration

This project integrates Wazuh, MISP, Shuffle, and DFIR IRIS via a centralized LangChain MCP Gateway.

## Prerequisites
- Docker & Docker Compose
- Ubuntu Server (Recommended for production)
- Minimum 16GB RAM, 4 vCPUs

## Platform Components
- **MCP Gateway**: Node.js/Express Gateway with JWT/OAuth and Logging.
- **Wazuh**: Security Event Management (SIEM).
- **MISP**: Threat Intelligence Platform.
- **Shuffle**: Security Orchestration, Automation and Response (SOAR).
- **DFIR IRIS**: Incident Response & Case Management.

## Setup Instructions (Ubuntu)

1.  **Clone the repository**:
    ```bash
    git clone <repo_url>
    cd antigravity
    ```

2.  **Run the Setup Script**:
    This script configures system limits (vm.max_map_count) and builds the stack.
    ```bash
    chmod +x setup.sh
    sudo ./setup.sh
    ```

3.  **Manual Start**:
    ```bash
    sysctl -w vm.max_map_count=262144
    docker-compose up -d --build
    ```

## Access Points
- **Gateway API**: `http://localhost:8080/mcp`
- **Wazuh Dashboard**: `https://localhost:8443` (Default: admin/SecretPassword123!)
- **Shuffle Frontend**: `https://localhost:3443`
- **DFIR IRIS**: `http://localhost:8080` (Check port mapping in docker-compose if different)
- **MISP**: `https://localhost:9443`

## Configuration
- Edit `.env` to change passwords and versions.
- **IMPORTANT**: Change `JWT_SECRET` and Database passwords for production.

## Development
- `npm install`
- `npm run dev:gateway`
