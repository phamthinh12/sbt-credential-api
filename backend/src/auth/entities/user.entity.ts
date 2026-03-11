export class User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'super_admin' | 'school_admin' | 'student' | 'viewer';
  schoolId?: string;
  createdAt: Date;
  updatedAt: Date;
}
