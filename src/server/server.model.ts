import { Server, createServer, ServerResponse, ClientRequest, IncomingMessage } from 'http'
import { RegisterRouteOptions } from './server.types'

const PORT = 8000;

export class ServerFactory {
    private routeRegistry: Record<string, RegisterRouteOptions> = {}

    public constructor(private readonly server: Server) { }

    public static base = (): ServerFactory => {
        return new ServerFactory(createServer());
    }

    public registerRoute = (options: RegisterRouteOptions): ServerFactory => {
        this.routeRegistry[this.constructRegistryKey(options)] = options;
        return this;
    }

    public run = (): ServerFactory => {
        this.server
            .on('request', this.processIncomingRequest)
            .listen(PORT, () => {
                console.log(`Listening on ${PORT}`);
            });
        return this;
    }

    private processIncomingRequest = async (request: IncomingMessage, response: ServerResponse) => {
        const key = this.constructRegistryKeyFromRequest(request);

        const options = this.routeRegistry[key];
        if (!options) return this.handleNotFound(response);

        const data = await options.processor(request);
        return response
            .writeHead(200, { accept: 'application/json', "content-type": "application/json" })
            .end(JSON.stringify({ data }));

    }

    private handleNotFound = (response: ServerResponse) => {
        response.writeHead(404);
        return response.end();
    }

    private constructRegistryKey = ({ path, method }: RegisterRouteOptions) => {
        return `${path}_${method}`;
    }

    private constructRegistryKeyFromRequest = ({ url, method }: IncomingMessage) => {
        return `${url}_${method}`;
    }
}