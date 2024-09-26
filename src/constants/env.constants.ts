import { ReplicationType } from '../replicator/replicator.types';

export const envConstans = {
    isMaster: process.env.IS_MASTER === 'true',
    replicaHostNames: <string>process.env.REPLICA_HOST_NAMES || '',
    secondaryAccessToken: <string>process.env.SECONDARY_ACCESS_TOKEN || '',
    replicationWriteConcern: <ReplicationType>process.env.REPLICATION_WRITE_CONCERN || 'master',
} as const;
