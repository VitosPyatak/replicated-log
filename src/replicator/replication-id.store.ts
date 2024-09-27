const DEFAULT_REPLICATION_ID = 0 as const;

export class ReplicationIdStore {
    public constructor(private objectId = DEFAULT_REPLICATION_ID) {}

    public next = (): number => {
        return ++this.objectId;
    };

    public current = (): number => {
        return this.objectId;
    };
}
