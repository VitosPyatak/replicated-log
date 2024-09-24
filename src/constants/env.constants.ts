export const envConstans = {
    isMaster: process.env.IS_MASTER === 'true',
    replicaHostNames: process.env.REPLICA_HOST_NAMES || '',
    secondaryAccessToken: process.env.SECONDARY_ACCESS_TOKEN || '',
} as const;
