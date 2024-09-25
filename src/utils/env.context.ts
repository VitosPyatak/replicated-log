import { envConstans } from '../constants/env.constants';

export class EnvContext {
    private static _isMaster: boolean = envConstans.isMaster;

    private static _replicaHostNames: string[] = envConstans.replicaHostNames.split(',');

    private static _secondaryAccessToken: string = envConstans.secondaryAccessToken;

    public static isMaster = () => {
        return EnvContext._isMaster;
    };

    public static isSecondary = () => {
        return !this.isMaster();
    };

    public static getReplicaHostNames = () => {
        return EnvContext._replicaHostNames;
    };

    public static getSecondaryAccessToken = () => {
        return EnvContext._secondaryAccessToken;
    };

    public static getReplicationWriteConcern = () => {
        if (envConstans.replicationWriteConcern) {
            return +envConstans.replicationWriteConcern;
        }
        return this.getNumberOfReplicas();
    };

    public static getNumberOfReplicas = () => {
        return this.getReplicaHostNames().length;
    };
}
