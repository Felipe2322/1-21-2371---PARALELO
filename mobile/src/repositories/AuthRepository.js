/**
 * Repositorio de Autenticación
 * Capa: Repository (MVVM) - Abstrae el acceso a datos
 */
import AuthService from '../services/auth.service';
import { User } from '../models/User';

class AuthRepository {
  /**
   * Login y retorna entidad User + token
   */
  async login(email, password) {
    const { user, token } = await AuthService.login(email, password);
    return { user: new User(user), token };
  }

  /**
   * Registro y retorna entidad User + token
   */
  async register(name, email, password, role) {
    const { user, token } = await AuthService.register(name, email, password, role);
    return { user: new User(user), token };
  }

  /**
   * Obtener usuario autenticado
   */
  async getMe() {
    const user = await AuthService.getMe();
    return new User(user);
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    await AuthService.logout();
  }

  /**
   * Verificar autenticación
   */
  async isAuthenticated() {
    return AuthService.isAuthenticated();
  }

  /**
   * Obtener usuario almacenado localmente
   */
  async getStoredUser() {
    const user = await AuthService.getStoredUser();
    return user ? new User(user) : null;
  }
}

export default new AuthRepository();
