export interface CMSClientTransportRequest {
  readonly init: RequestInit
  readonly operation?: {
    readonly name: string
    readonly path: string
  }
  readonly source: "operation" | "payload"
  readonly url: string
}

export type CMSClientTransport = (
  request: CMSClientTransportRequest
) => Promise<Response>;

export interface CMSClientPlugin {
  readonly name: string
  wrapTransport(next: CMSClientTransport): CMSClientTransport
}
