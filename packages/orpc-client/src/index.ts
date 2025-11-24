import { EnvManager, merge } from "@nexload-sdk/env";
import { $NodePreset } from "@nexload-sdk/env/presets";
import { UndiciHttpClient } from "@nexload-sdk/pool-fetch";
import logger from "@nexload-sdk/logger";
import { RPCLink } from "@orpc/client/fetch";
import { ClientContext, createORPCClient } from "@orpc/client";
import { AnyContractRouter, ContractRouterClient } from "@orpc/contract";

class ORPCClient<
  TRouter extends AnyContractRouter,
  TClientContext extends ClientContext = Record<never, never>,
> {
  protected readonly isProduction;
  protected readonly client;
  protected readonly env;

  constructor(public defaultApiUrl: string = "http://localhost:3000") {
    logger.debug({
      class: "ORPCClient",
      method: "constructor",
      arguments: { defaultApiUrl },
    });

    this.env = new EnvManager(
      merge($NodePreset, {
        PAYLOAD_API_URL: { type: "string" },
      })
    );

    this.isProduction = this.env.$("NODE_ENV") === "production";
    this.client = new UndiciHttpClient();
  }

  protected get apiUrl() {
    const url = this.env.$("PAYLOAD_API_URL");

    if (this.isProduction && !url) {
      logger.error(
        { class: "ORPCClient", method: "apiUrl" },
        "'PAYLOAD_API_URL' is not set in production environment"
      );
    }

    return url || this.defaultApiUrl;
  }

  protected get headers() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": `@nexload-sdk/orpc-client (${this.env.$("NODE_ENV")})`,
      "X-Service": this.env.$("SERVICE_NAME"),
      "X-Communication": "server-to-server",
    };
  }

  protected createOptimizedRPCLink(): RPCLink<TClientContext> {
    return new RPCLink({
      url: this.apiUrl,
      fetch: this.client.fetch,
      headers: this.headers,
    });
  }

  public createClient(): ContractRouterClient<TRouter> {
    return createORPCClient(this.createOptimizedRPCLink());
  }
}

export default ORPCClient;
