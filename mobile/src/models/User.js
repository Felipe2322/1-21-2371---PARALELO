export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.role = data.role || 'user';
    this.avatar = data.avatar || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
  }

  get isAdmin() {
    return this.role === 'admin';
  }

  get initials() {
    return this.name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      avatar: this.avatar,
      isActive: this.isActive,
    };
  }
}

export class CreateUserDTO {
  constructor(name, email, password, role = 'user') {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  validate() {
    const errors = {};
    if (!this.name || this.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.email = 'Correo invalido';
    }
    if (!this.password || this.password.length < 6) {
      errors.password = 'La contrasena debe tener al menos 6 caracteres';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  }
}

export class UpdateUserDTO {
  constructor(data = {}) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.isActive = data.isActive;
    this.avatar = data.avatar;
  }

  toJSON() {
    const obj = {};
    if (this.name !== undefined) obj.name = this.name;
    if (this.email !== undefined) obj.email = this.email;
    if (this.password !== undefined) obj.password = this.password;
    if (this.role !== undefined) obj.role = this.role;
    if (this.isActive !== undefined) obj.isActive = this.isActive;
    if (this.avatar !== undefined) obj.avatar = this.avatar;
    return obj;
  }
}

export class LoginDTO {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  validate() {
    const errors = {};
    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.email = 'Correo invalido';
    }
    if (!this.password || this.password.length < 1) {
      errors.password = 'Contrasena requerida';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  }
}
