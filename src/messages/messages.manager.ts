import { ReplicationEntity } from '../replicator/replicator.types';
import { EnvContext } from '../utils/env.context';
import { StoreMessage, StoreMessageId } from './messages.types';

export class MessagesManager {
    private messagesIndex: Record<string, StoreMessage> = {};
    private messagesReplicationIndex: Record<string, StoreMessage> = {};

    private static instance = new MessagesManager();

    public static get = (): MessagesManager => {
        return this.instance;
    };

    public save = ({
        _replicationId,
        ...message
    }: ReplicationEntity<StoreMessage>): ReplicationEntity<StoreMessage> => {
        if (this.messagesIndex[message.id]) {
            throw new Error('Message already exists');
        }

        if (_replicationId) {
            this.messagesReplicationIndex[_replicationId] = message;
        }

        this.messagesIndex[message.id] = message;
        return message;
    };

    public getAll = (): StoreMessage[] => {
        return Object.keys(this.messagesReplicationIndex).map((key) => this.messagesReplicationIndex[key]);
    };

    public getById = (id: string): StoreMessage | undefined => {
        return this.messagesIndex[id];
    };

    public delete = ({ _replicationId, id }: ReplicationEntity<StoreMessageId>): void => {
        if (_replicationId) {
            delete this.messagesReplicationIndex[_replicationId];
        }

        delete this.messagesIndex[id];
    };
}
