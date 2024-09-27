export type StoreMessageId = {
    id: string;
};

export type StoreMessage = StoreMessageId & {
    content: string;
};
