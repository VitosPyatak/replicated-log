import { StoreMessage } from '../messages/messages.types';

export class Logger {
    private constructor(private readonly className: string) { }

    public static forClass = (className: string) => {
        return new Logger(className);
    }

    public static logIncommingMessage = (message: StoreMessage) => {
        console.info(`Received message: ${JSON.stringify(message)}`);
    };

    public info = (message: string) => {
        console.info(`[${this.className}]: ${message}`);
    };
}
