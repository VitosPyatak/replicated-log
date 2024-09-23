
import { IncomingMessage } from "http";

export const parseIncommingMessageData = async <T>(request: IncomingMessage): Promise<T> => {
    return new Promise((resolve) => {
        let body: string[] = [];

        request.on('data', (chunk) => {
            body.push(chunk);
        });

        request.on('end', () => {
            resolve(JSON.parse(body.join('')) as T);
        });
    });
}