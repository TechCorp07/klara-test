// src/lib/auth/tab-auth-utils.ts
export interface TabSession {
    tabId: string;
    jwtToken: string;
    refreshToken?: string;
    loginTime: number;
    lastActivity: number;
    userEmail: string;
    userId: number;
    role: string;
  }
  
  export class TabAuthManager {
    private static readonly TAB_ID_KEY = 'healthcare_tab_id';
    private static readonly TAB_SESSION_KEY = 'healthcare_tab_session';
    private static readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
    /**
     * Generate a unique tab identifier
     */
    static generateTabId(): string {
      return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  
    /**
     * Get or create tab ID for current tab
     */
    static getTabId(): string {
      if (typeof window === 'undefined') return '';
      
      let tabId = sessionStorage.getItem(this.TAB_ID_KEY);
      if (!tabId) {
        tabId = this.generateTabId();
        sessionStorage.setItem(this.TAB_ID_KEY, tabId);
      }
      return tabId;
    }
  
    /**
     * Store tab-specific session data
     */
    static setTabSession(sessionData: Omit<TabSession, 'tabId' | 'loginTime' | 'lastActivity'>): void {
      if (typeof window === 'undefined') return;
  
      const tabId = this.getTabId();
      const session: TabSession = {
        ...sessionData,
        tabId,
        loginTime: Date.now(),
        lastActivity: Date.now(),
      };
  
      sessionStorage.setItem(this.TAB_SESSION_KEY, JSON.stringify(session));
      
      // Also store in localStorage for cross-tab session management
      this.updateGlobalTabRegistry(session);
    }
  
    /**
     * Get tab-specific session data
     */
    static getTabSession(): TabSession | null {
      if (typeof window === 'undefined') return null;
  
      const sessionData = sessionStorage.getItem(this.TAB_SESSION_KEY);
      if (!sessionData) return null;
  
      try {
        const session: TabSession = JSON.parse(sessionData);
        
        // Check if session is expired
        if (this.isSessionExpired(session)) {
          this.clearTabSession();
          return null;
        }
  
        // Update last activity
        session.lastActivity = Date.now();
        sessionStorage.setItem(this.TAB_SESSION_KEY, JSON.stringify(session));
        this.updateGlobalTabRegistry(session);
  
        return session;
      } catch (error) {
        console.error('Error parsing tab session:', error);
        this.clearTabSession();
        return null;
      }
    }
  
    /**
     * Clear tab-specific session
     */
    static clearTabSession(): void {
      if (typeof window === 'undefined') return;
  
      const tabId = this.getTabId();
      sessionStorage.removeItem(this.TAB_SESSION_KEY);
      
      // Remove from global registry
      this.removeFromGlobalTabRegistry(tabId);
    }
  
    /**
     * Check if session is expired due to inactivity
     */
    private static isSessionExpired(session: TabSession): boolean {
      return Date.now() - session.lastActivity > this.ACTIVITY_TIMEOUT;
    }
  
    /**
     * Update global tab registry for cross-tab session management
     */
    private static updateGlobalTabRegistry(session: TabSession): void {
      if (typeof window === 'undefined') return;
  
      try {
        const registryKey = 'healthcare_tab_registry';
        const registryData = localStorage.getItem(registryKey);
        const registry: Record<string, Omit<TabSession, 'jwtToken' | 'refreshToken'>> = registryData ? JSON.parse(registryData) : {};
  
        // Store session info without sensitive tokens
        registry[session.tabId] = {
          tabId: session.tabId,
          loginTime: session.loginTime,
          lastActivity: session.lastActivity,
          userEmail: session.userEmail,
          userId: session.userId,
          role: session.role,
        };
  
        // Clean up expired sessions
        Object.keys(registry).forEach(tabId => {
          if (this.isSessionExpired(registry[tabId] as TabSession)) {
            delete registry[tabId];
          }
        });
  
        localStorage.setItem(registryKey, JSON.stringify(registry));
      } catch (error) {
        console.error('Error updating tab registry:', error);
      }
    }
  
    /**
     * Remove tab from global registry
     */
    private static removeFromGlobalTabRegistry(tabId: string): void {
      if (typeof window === 'undefined') return;
  
      try {
        const registryKey = 'healthcare_tab_registry';
        const registryData = localStorage.getItem(registryKey);
        if (!registryData) return;
  
        const registry = JSON.parse(registryData);
        delete registry[tabId];
        localStorage.setItem(registryKey, JSON.stringify(registry));
      } catch (error) {
        console.error('Error removing from tab registry:', error);
      }
    }
  
    /**
     * Get all active tab sessions (for debugging/monitoring)
     */
    static getActiveTabSessions(): Record<string, Omit<TabSession, 'jwtToken' | 'refreshToken'>> {
      if (typeof window === 'undefined') return {};
  
      try {
        const registryKey = 'healthcare_tab_registry';
        const registryData = localStorage.getItem(registryKey);
        return registryData ? JSON.parse(registryData) : {};
      } catch (error) {
        console.error('Error getting active tab sessions:', error);
        return {};
      }
    }
  
    /**
     * Check if current tab has valid authentication
     */
    static isCurrentTabAuthenticated(): boolean {
      const session = this.getTabSession();
      return session !== null && !!session.jwtToken;
    }
  
    /**
     * Get current tab's JWT token
     */
    static getCurrentTabToken(): string | null {
      const session = this.getTabSession();
      return session?.jwtToken || null;
    }
  
    /**
     * Update last activity timestamp
     */
    static updateActivity(): void {
      const session = this.getTabSession();
      if (session) {
        session.lastActivity = Date.now();
        sessionStorage.setItem(this.TAB_SESSION_KEY, JSON.stringify(session));
        this.updateGlobalTabRegistry(session);
      }
    }
  
    /**
     * Clear all tab sessions (for full logout)
     */
    static clearAllTabSessions(): void {
      if (typeof window === 'undefined') return;
  
      // Clear current tab
      this.clearTabSession();
      
      // Clear global registry
      localStorage.removeItem('healthcare_tab_registry');
    }
  }