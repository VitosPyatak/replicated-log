export const envConstans = {
    isMaster: process.env.IS_MASTER === 'true',
    replicaHostNames: process.env.REPLICA_HOST_NAMES || '',
    secondaryAccessToken: process.env.SECONDARY_ACCESS_TOKEN || '',
    replicationWriteConcern: process.env.REPLICATION_WRITE_CONCERN,
} as const;
