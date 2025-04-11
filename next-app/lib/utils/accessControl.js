/**
 * Check if user has a specific role
 * @param {Object} user - User object
 * @param {string|Array} roles - Role or array of roles to check
 * @returns {boolean} True if user has role, false otherwise
 */
export function hasRole(user, roles) {
    if (!user || !user.role) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  }
  
  /**
   * Check if user can access a specific page or feature
   * @param {Object} user - User object
   * @param {Object} permissions - Permission configuration
   * @returns {boolean} True if user has permission, false otherwise
   */
  export function hasPermission(user, permission) {
    if (!user || !permission) return false;
    
    // System admins have access to everything
    if (user.role === 'superadmin') return true;
    
    // Check role-based permissions
    if (permission.roles && hasRole(user, permission.roles)) {
      return true;
    }
    
    // Check specific permissions
    if (permission.permissions && user.permissions) {
      return permission.permissions.some(p => user.permissions.includes(p));
    }
    
    return false;
  }