import { MessagesManager } from './messages.manager';
import { StoreMessage } from './messages.types';
import { Logger } from '../logger/logger.manager';
import { ParsedIncommingRequest } from '../server/server.types';
import { EnvContext } from '../utils/env.context';
import { randomTimeoutUpTo } from '../utils/time.utils';
import { ReplicationEntity } from '../replicator/replicator.types';

const TIMEOUT_LIMIT = 10000;

export class MessagesController {
    private readonly logger = Logger.forClass(MessagesController.name);

    private constructor(private readonly messagesManager: MessagesManager) {}

    private static instance = new MessagesController(MessagesManager.get());

    private static timeout = EnvContext.isSecondary() ? TIMEOUT_LIMIT : 0;

    public static get = () => {
        return this.instance;
    };

    public saveMessage = async ({ data }: ParsedIncommingRequest<ReplicationEntity<StoreMessage>>) => {
        if (!data) {
            throw new Error('Invalid message');
        }

        this.logger.info(`Saving message: ${JSON.stringify(data)}`);

        return randomTimeoutUpTo(MessagesController.timeout).then(() => this.messagesManager.save(data));
    };

    public getAll = async (__: ParsedIncommingRequest<any>) => {
        return this.messagesManager.getAll();
    };
}
