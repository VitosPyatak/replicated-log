import { MessagesController } from "./messages/messages.controller"
import { ServerFactory } from "./server/server.model"

(async () => {
    ServerFactory.base()
        .registerRoute({ path: '/messages', method: 'POST', processor: MessagesController.get().saveMessage, })
        .registerRoute({ path: '/messages', method: 'GET', processor: MessagesController.get().getAll })
        .run()
})()