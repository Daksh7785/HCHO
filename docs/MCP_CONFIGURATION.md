# Model Context Protocol (MCP) Configuration Guide

The **Model Context Protocol (MCP)** enables AI agents and assistants to safely and programmatically interact with local tools, environments, and databases. This guide defines how to configure MCP servers for the HCHO platform.

---

## 1. Overview of MCP Server Implementations

| MCP Server Name | Purpose | Key Tools Provided |
| :--- | :--- | :--- |
| **Filesystem MCP** | Safe, scoped access to write & read files | `read_file`, `write_to_file`, `list_dir` |
| **Git MCP** | Version control automation | `git_status`, `git_diff`, `git_commit` |
| **PostgreSQL MCP**| SQL query execution & schema inspections | `query_db`, `list_tables`, `describe_table` |
| **Redis MCP** | Cache monitoring & task queue inspection | `redis_get`, `redis_set`, `redis_keys` |
| **Browser MCP** | Dynamic UI rendering and automation | `open_browser_url`, `click_element` |
| **Terminal MCP** | Local command execution | `run_command` |

---

## 2. Configuration Settings (JSON)

Add the following schemas to your IDE or Agent Client Configuration (typically located in `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/mcp_settings.json` or your project settings folder):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "c:/Users/ASUS/Desktop/HCHO/HCHO"],
      "env": {}
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"],
      "env": {}
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "--connection-string", "postgresql://postgres:postgres_secure_pass@localhost:5432/hcho_db"],
      "env": {}
    },
    "redis": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-redis", "--url", "redis://:redis_secure_pass@localhost:6379"],
      "env": {}
    },
    "puppeteer-browser": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {}
    }
  }
}
```

---

## 3. Capabilities & Usage Examples

### 1. Interacting with Spatial Databases
You can use the Postgres MCP to check the status of our spatial geometries:
```sql
SELECT id, name, ST_AsText(geom) FROM monitoring_stations;
```

### 2. Monitoring Task Queues
You can query the Redis MCP for active Celery worker heartbeats or queued tasks:
```bash
KEYS celery-task-meta-*
```

### 3. Filesystem Inspections
Enforces directory boundaries to prevent agents from modifying files outside `c:/Users/ASUS/Desktop/HCHO/HCHO`.
