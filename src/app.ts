import { httpMethods } from './constants/http.constants';
import { appRoutes } from './constants/route.constants';
import { MessagesController } from './messages/messages.controller';
import { ServerFactory } from './server/server.model';
import { EnvContext } from './utils/env.context';

(async () => {
    ServerFactory.base()
        .registerRoute({
            path: appRoutes.messages,
            method: httpMethods.POST,
            replicateRequest: EnvContext.isMaster(),
            accessStrategy: 'default',
            processor: MessagesController.get().saveMessage,
        })
        .registerRoute({
            path: appRoutes.messages,
            method: 'GET',
            processor: MessagesController.get().getAll,
        })
        .run();

    process.on('uncaughtException', (error) => {
        console.error('Uncaught exception', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled rejection at:', promise, 'reason:', reason);
    });
})();
