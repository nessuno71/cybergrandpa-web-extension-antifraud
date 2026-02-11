---
title: Security Guidelines
description: Browser extension security best practices and permissions
---

# Security Guidelines

## Required Browser Permissions

- `activeTab`, `alarms`, `scripting`, `storage`, `tabs`
- `webNavigation`, `declarativeNetRequestWithHostAccess`
- `host_permissions` for all URLs

## Security Best Practices

### Data Validation

- Validate all external data sources (blocklist URL)
- Sanitize user inputs and external URLs
- Use Content Security Policy appropriately

### Permission Scoping

- Implement proper permission scoping
- Only request permissions that are absolutely necessary
- Use optional permissions for non-essential features

### Storage Security

- Use WXT storage API with local storage
- Compress sensitive data using streams and base64 encoding
- Never store API keys, tokens, or credentials in code

### Content Security

- Content security policy allows `wasm-unsafe-eval` for extension pages only
- Avoid inline scripts and styles
- Use nonces or hashes when necessary

### Cross-Context Communication

- Use `@webext-core/proxy-service` for secure cross-context messaging
- Validate all message payloads
- Implement proper error handling for message failures

## Never Commit

- Secrets: API keys, tokens, or credentials
- Production configs without approval
- Build outputs or temporary files
