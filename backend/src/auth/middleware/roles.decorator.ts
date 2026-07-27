import type { Role } from '../../lib/project';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => Reflect.metadata(ROLES_KEY, roles);
