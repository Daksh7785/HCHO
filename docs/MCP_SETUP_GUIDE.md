# Model Context Protocol (MCP) Setup Guide

This guide walks you through registering and using **Model Context Protocol (MCP)** servers to enable advanced AI-driven development capabilities on the HCHO platform.

---

## 1. Prerequisites
- **Node.js**: v18.0.0+ (specifically v24.15.0+ installed on this machine).
- **npm**: 10.0.0+ (specifically 11.12.1 installed).
- MCP clients (such as Cursor, VS Code Claude Dev, or Claude Desktop).

---

## 2. Registering MCP Servers

To register these servers, you will need to add them to your client configuration file. Below are the steps for major clients:

### Claude Desktop Configuration
On Windows, open `%APPDATA%\Claude\claude_desktop_config.json`. If it does not exist, create it with the following contents:

```json
{
  "mcpServers": {
    "hcho-postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "--connection-string",
        "postgresql://postgres:postgres_secure_pass@localhost:5432/hcho_db"
      ]
    },
    "hcho-redis": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-redis",
        "--url",
        "redis://:redis_secure_pass@localhost:6379"
      ]
    },
    "hcho-filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "c:/Users/ASUS/Desktop/HCHO/HCHO"
      ]
    }
  }
}
```

---

## 3. Verifying the Connection

Once the JSON config is saved, restart your MCP client. 

1. **Verify Filesystem Access**:
   Ensure the agent can list and read files inside the project scope:
   `c:/Users/ASUS/Desktop/HCHO/HCHO`

2. **Verify Database Connections**:
   If the PostgreSQL Docker container is running, the agent will list tools like `query_db` and `list_tables`. You can ask the AI assistant:
   > "Describe the `monitoring_stations` table in my postgres database."

3. **Verify Redis Monitoring**:
   Verify that the agent can read key statistics:
   > "Check the Redis keys to see if celery tasks are writing output."

---

## 4. Security Scope
- **Filesystem scope**: The Filesystem MCP restricts operations solely to the specified directory. This prevents AI agents from accidentally reading or modifying system files or directories elsewhere on the host machine.
- **Port scope**: Ensure that ports `5432` and `6379` are protected and not exposed to the public internet without proper authentication.
