export type JwtPayload = {
  email: string;
  sub: string;
  role: string;
  roleId: string;
  permissionIds: string[];
};