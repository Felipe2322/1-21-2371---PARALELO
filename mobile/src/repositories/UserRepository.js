/**
 * Repositorio de Usuarios
 * Capa: Repository (MVVM)
 */
import UserService from '../services/user.service';
import { User } from '../models/User';

class UserRepository {
  /**
   * Obtener lista de usuarios
   */
  async getUsers(params = {}) {
    const data = await UserService.getUsers(params);
    return {
      users: data.users.map((u) => new User(u)),
      pagination: data.pagination,
    };
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id) {
    const user = await UserService.getUserById(id);
    return new User(user);
  }

  /**
   * Crear usuario
   */
  async createUser(dto) {
    const user = await UserService.createUser(dto);
    return new User(user);
  }

  /**
   * Actualizar usuario
   */
  async updateUser(id, dto) {
    const user = await UserService.updateUser(id, dto.toJSON ? dto.toJSON() : dto);
    return new User(user);
  }

  /**
   * Dar de baja usuario
   */
  async deleteUser(id) {
    const user = await UserService.deleteUser(id);
    return new User(user);
  }
}

export default new UserRepository();
