export type ReplicationType = 'master' | number;

export type ReplicationEntity<T> = T & {
    _replicationId?: number;
};
