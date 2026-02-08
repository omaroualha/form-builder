import { AbstractService } from '../../AbstractService';
import type { AuthResponse, LoginData, RegisterData, User } from './models';

export class AuthService extends AbstractService {
  async login(data: LoginData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/login', data);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/register', data);
  }

  async logout(): Promise<void> {
    await this.post('/logout');
  }

  async getUser(): Promise<User> {
    return this.get<User>('/user');
  }
}
