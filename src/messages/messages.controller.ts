import { IncomingMessage } from "http";
import { MessagesManager } from "./messages.manager";
import { StoreMessage } from "./messages.types";
import { parseIncommingMessageData } from "../server/server.utils";

export class MessagesController {
    private constructor(private readonly messagesManager: MessagesManager) { }

    private static instance = new MessagesController(MessagesManager.get());

    public static get = () => {
        return this.instance;
    }

    public saveMessage = async (request: IncomingMessage) => {
        const message = await parseIncommingMessageData<StoreMessage>(request);
        return this.messagesManager.save(message);
    }

    public getAll = async (__: IncomingMessage) => {
        return this.messagesManager.getAll();
    }
}