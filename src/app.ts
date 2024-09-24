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
            processor: MessagesController.get().saveMessage,
        })
        .registerRoute({ path: appRoutes.messages, method: 'GET', processor: MessagesController.get().getAll })
        .run();
})();
