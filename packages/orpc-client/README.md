# @nexload-sdk/orpc-client

<div align="center">
  <img src="https://img.shields.io/badge/cloud--native-rpc-purple?style=flat-square" alt="cloud-native rpc" />
  <img src="https://img.shields.io/badge/types-typescript-blue?style=flat-square" alt="typescript" />
  <img src="https://img.shields.io/npm/v/@nexload-sdk/orpc-client?style=flat-square" alt="npm version" />
  <br><br>
  <strong>A minimal, high-performance factory for creating optimized oRPC clients, designed for persistent, low-latency, server-to-server communication in cloud-native architectures.</strong>
</div>

---

## Features

- 🤝 **End-to-End Type Safety:** Leverages oRPC's contract-first approach to guarantee type safety between services, eliminating integration errors at build time.
- ⚡ **Persistent, Low-Latency Connections:** Integrates `@nexload-sdk/pool-fetch` to use `undici` for efficient HTTP connection pooling. This is ideal for the high-throughput, persistent communication required between internal microservices.
- ☁️ **Cloud-Native Design:** Built for modern backends. It provides a lightweight, resilient, and observable client crucial for distributed systems and microservices.
- 🛡️ **Environment-Aware & Secure:** Integrates with `@nexload-sdk/env` for type-safe configuration and automatically sets essential headers (`User-Agent`, `X-Service`, `X-Communication`) for secure and identifiable inter-service calls.
- 🪵 **Structured Logging:** Uses `@nexload-sdk/logger` for detailed, structured logs, providing critical observability into the client's behavior and performance.
- 🚀 **Simplified API:** Abstracts away the complexity of transport, headers, and configuration, offering a simple `createClient()` method to get a production-ready oRPC client instantly.

---

## Installation

```bash
pnpm add @nexload-sdk/orpc-client
# or
yarn add @nexload-sdk/orpc-client
# or
npm install @nexload-sdk/orpc-client
```

---

## Quick Start

Instantiate `ORPCClient` and use the `createClient` method to get a ready-to-use, optimized oRPC client for your backend service.

```typescript
import ORPCClient from '@nexload-sdk/orpc-client';
// Assuming 'AppRouter' is your auto-generated oRPC router type
import { type AppRouter } from './path/to/your/orpc/router';

// Initialize the client factory for a specific service
// This URL is a fallback; the client prefers the `PAYLOAD_API_URL` env var.
const clientFactory = new ORPCClient<AppRouter>('http://api.example.com');

// Create the oRPC client instance
const orpc = clientFactory.createClient();

// Now you can make fully type-safe RPC calls to another internal service
async function communicateWithAuthService() {
  try {
    // Example: calling a 'users.get' procedure
    const user = await orpc.query('users.get', { id: 'user-123' });
    console.log('Fetched user:', user);

    // Example: calling a 'sessions.create' procedure
    const session = await orpc.mutation('sessions.create', { userId: user.id });
    console.log('Created session:', session);
  } catch (error) {
    // The error will also be typed based on your oRPC contract
    console.error('oRPC call failed:', error);
  }
}

communicateWithAuthService();
```

---

## Architecture and Philosophy

This package is built on the philosophy that inter-service communication in a modern, cloud-native environment must be **resilient, performant, and observable**.

**oRPC (OpenAPI Remote Procedure Call)** forms the foundation, providing a "contract-first" methodology. You define your API in a schema, and oRPC ensures that both client and server adhere to it, providing compile-time safety and eliminating a whole class of runtime errors.

`@nexload-sdk/orpc-client` enhances this by acting as a specialized factory for oRPC clients tailored for **server-to-server communication**. Instead of creating a new connection for every request, it establishes a persistent, highly-efficient communication channel using:

1.  **Optimized Transport:** It uses `@nexload-sdk/pool-fetch` which leverages `undici`'s connection pooling. This drastically reduces the overhead of TCP handshakes and is perfect for the frequent, low-latency calls typical between microservices.
2.  **Intelligent Configuration:** It sources its configuration from the environment via `@nexload-sdk/env`, making it adaptable and easy to manage in containerized deployments.
3.  **Rich Context:** It automatically injects headers that provide context for logging, tracing, and debugging in a distributed system.

The result is a minimal-footprint client that delivers maximum performance and reliability for your internal service mesh.

---

## Configuration

The client is configured through environment variables, managed by `@nexload-sdk/env`.

| Environment Variable | Description                                     | Default               |
| -------------------- | ----------------------------------------------- | --------------------- |
| `PAYLOAD_API_URL`    | The base URL of the target oRPC API service.    | `http://localhost:3000` |
| `NODE_ENV`           | The runtime environment (`production` or `development`). | `development`         |
| `SERVICE_NAME`       | The name of the source service using the client. | `orpc-client`         |
| `LOG_LEVEL`          | The logging level for structured logs.          | `info`                |

---

## Best Practices

- **One Client Per Target Service:** For clarity and better connection management, instantiate one `ORPCClient` factory for each distinct backend service you need to communicate with.
- **Contract-First Workflow:** Embrace the oRPC workflow. Define your API contracts first, generate your router types, and then use them to achieve full end-to-end type safety.
- **Microservice Communication:** This package is ideal for replacing traditional REST calls between internal services. The performance gain from connection pooling and the safety of RPC make it a superior choice.
- **Environment Variables:** Always configure your services using environment variables. This is crucial for portability and security in cloud-native deployments (e.g., Kubernetes, Docker Swarm).

---

## Contributing

1.  Fork this repo, create a feature branch (`feat/name`).
2.  Make your changes — ensure all types, tests, and lint pass.
3.  Follow commit message convention: `feat(scope): your description`.
4.  Open a pull request (PR).

---

## License

MIT © GecutWeb Contributors

---

## Branding

Built by [NexLoad SDK](https://github.com/gecut/nexload-sdk) · Scalable, modern, and robust developer tooling for next-generation software.
