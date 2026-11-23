import logger, { configureLogger } from "@nexload-sdk/logger";
import "./style.css";

configureLogger({ service: "web-demo" });

const log = logger.child({ module: "demo" });
log.info({ event: "app.lifecycle.started" }, "Web demo started");
log.debug({ event: "demo.configuration.loaded" }, "Demo configuration loaded");
log.success({ event: "demo.lifecycle.ready" }, "Web demo ready");
