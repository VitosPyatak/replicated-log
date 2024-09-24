import { StoreMessage } from './messages.types';

export class MessagesManager {
    private messagesStore: Record<string, StoreMessage> = {};

    private static instance = new MessagesManager();

    public static get = (): MessagesManager => {
        return this.instance;
    };

    public save = (message: StoreMessage): StoreMessage => {
        this.messagesStore[message.id] = message;
        return message;
    };

    public getAll = (): StoreMessage[] => {
        return Object.values(this.messagesStore);
    };
}
