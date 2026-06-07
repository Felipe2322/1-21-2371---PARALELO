import UserService from '../services/user.service';
import ProfileService from '../services/profile.service';
import ConfigService from '../services/config.service';
import UploadService from '../services/upload.service';
import { User } from '../models/User';
import { AppConfig } from '../models/AppConfig';
import { FileUpload } from '../models/FileUpload';

class DashboardRepository {
  async loadDashboardData({ includeUsers = true } = {}) {
    const startTime = Date.now();

    const usersPromise = includeUsers
      ? UserService.getUsers({ limit: 5 })
      : Promise.resolve({ users: [], pagination: { total: 0 } });

    const [usersData, profile, config, files] = await Promise.all([
      usersPromise,
      ProfileService.getProfile(),
      ConfigService.getConfig(),
      UploadService.getFiles(),
    ]);

    return {
      users: usersData.users.map((item) => new User(item)),
      totalUsers: usersData.pagination?.total || 0,
      profile,
      config: new AppConfig(config),
      files: files.map((item) => new FileUpload(item)),
      loadTime: Date.now() - startTime,
    };
  }

  async loadMultipleUsers(userIds) {
    const promises = userIds.map((id) => UserService.getUserById(id));
    const users = await Promise.all(promises);
    return users.map((item) => new User(item));
  }

  async loadStats() {
    const [allUsers, adminUsers, files] = await Promise.all([
      UserService.getUsers({ limit: 1 }),
      UserService.getUsers({ role: 'admin', limit: 1 }),
      UploadService.getFiles(),
    ]);

    return {
      totalUsers: allUsers.pagination?.total || 0,
      totalAdmins: adminUsers.pagination?.total || 0,
      totalFiles: files.length,
    };
  }
}

export default new DashboardRepository();
