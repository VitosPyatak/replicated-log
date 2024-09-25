import { IncomingMessage } from 'http';

export const parseIncommingMessageData = async <T>(request: IncomingMessage): Promise<T | null> => {
    return new Promise((resolve) => {
        let body: string[] = [];

        request.on('data', (chunk) => {
            body.push(chunk);
        });

        request.on('end', () => {
            try {
                const parsedBody = JSON.parse(body.join('')) as T;
                return resolve(parsedBody);
            } catch {
                return resolve(null);
            }
        });
    });
};
