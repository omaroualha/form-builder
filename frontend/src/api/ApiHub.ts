import { AbstractService, ServiceConfig } from "./AbstractService";
import { AuthService } from "./services/auth";
import { FormService } from "./services/forms";

export class ApiHub {
  readonly auth: AuthService;
  readonly forms: FormService;

  private services: AbstractService[];

  constructor(config: ServiceConfig) {
    this.auth = new AuthService(config);
    this.forms = new FormService(config);

    this.services = [this.auth, this.forms];
  }

  setAccessToken(token: string | null): void {
    this.services.forEach((service) => service.setAccessToken(token));
  }
}
