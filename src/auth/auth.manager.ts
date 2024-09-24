import { IncomingMessage, request, ServerResponse } from 'http';
import { RegisterRouteOptions } from '../server/server.types';
import { AppAcessStrategies } from './auth.types';
import { EnvContext } from '../utils/env.context';

export class AuthManager {
  private static instance = new AuthManager();

  private constructor() { }

  public static get = () => {
    return this.instance;
  }

  private readonly authenticationValidators: Record<AppAcessStrategies, (request: IncomingMessage) => void> = {
    default: (request) => this.defaultStrategyValidator(request),
  }

  private readonly authenticationGenerators: Record<AppAcessStrategies, () => string> = {
    default: () => this.defaultStrategyGenerator(),
  }

  public validate = (request: IncomingMessage, options: RegisterRouteOptions): void => {
    if (!options.accessStrategy) return;

    const validator = this.authenticationValidators[options.accessStrategy];
    if (!validator) throw new Error('Unknown access strategy');
    validator(request);
  }

  public generateAccessToken = (accessStrategy: AppAcessStrategies) => {
    const generator = this.authenticationGenerators[accessStrategy];
    if (!generator) throw new Error('Unknown access strategy');
    return generator();
  }

  private defaultStrategyValidator = (request: IncomingMessage): void => {
    if (EnvContext.isMaster()) return;
    const { authorization } = request.headers;
    console.log('authorization', authorization);
    console.log('EnvContext.getSecondaryAccessToken()', EnvContext.getSecondaryAccessToken());
    if (EnvContext.getSecondaryAccessToken() === authorization) return;
    throw new Error('Unauthorized');
  }

  private defaultStrategyGenerator = (): string => {
    return EnvContext.getSecondaryAccessToken();
  }
}
