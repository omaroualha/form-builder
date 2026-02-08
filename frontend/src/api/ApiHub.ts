import { AbstractService, ServiceConfig } from "./AbstractService";
import { AuthService } from "./services/auth";

export class ApiHub {
  readonly auth: AuthService;

  private services: AbstractService[];

  constructor(config: ServiceConfig) {
    this.auth = new AuthService(config);

    this.services = [this.auth];
  }

  setAccessToken(token: string | null): void {
    this.services.forEach((service) => service.setAccessToken(token));
  }
}
