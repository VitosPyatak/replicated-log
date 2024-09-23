import { IncomingMessage } from "http"

export type RegisterRouteOptions = {
    path: string
    method: string
    processor: (request: IncomingMessage) => Promise<any>
}