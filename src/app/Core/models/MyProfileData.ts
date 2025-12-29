export interface UserProfile {
  name: string;
  email: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}
