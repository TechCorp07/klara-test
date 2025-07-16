// src/lib/auth/token-refresh-manager.ts
'use client';

import React from 'react';
import { JWTPayload } from './validator';

interface RefreshConfig {
  refreshThresholdMinutes: number; // Minutes before expiry to refresh
  maxRetries: number;
  retryDelayMs: number;
  enableProactiveRefresh: boolean;
}

interface RefreshEvent {
  type: 'refresh_started' | 'refresh_success' | 'refresh_failed' | 'refresh_scheduled';
  timestamp: Date;
  timeToExpiration?: number;
  error?: string;
  retryCount?: number;
}

/**
 * Phase 3: Automatic Token Refresh Manager
 * Proactively refreshes JWT tokens before expiration to maintain seamless user experience
 */
export class TokenRefreshManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private retryCount = 0;
  private refreshCallback: (() => Promise<void>) | null = null;
  private eventListeners: ((event: RefreshEvent) => void)[] = [];
  
  private config: RefreshConfig = {
    refreshThresholdMinutes: 5, // Refresh when 5 minutes left
    maxRetries: 3,
    retryDelayMs: 5000, // 5 seconds between retries
    enableProactiveRefresh: true
  };

  constructor(config?: Partial<RefreshConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Start monitoring a JWT token for expiration
   */
  public startMonitoring(jwtPayload: JWTPayload, refreshCallback: () => Promise<void>): void {
    if (!this.config.enableProactiveRefresh) {
      return;
    }

    this.refreshCallback = refreshCallback;
    this.retryCount = 0;
    
    // Stop any existing monitoring
    this.stopMonitoring();

    const timeToExpiration = this.getTimeToExpiration(jwtPayload);
    
    if (timeToExpiration <= 0) {
      // Token already expired, refresh immediately
      this.performRefresh();
      return;
    }

    const refreshThresholdMs = this.config.refreshThresholdMinutes * 60 * 1000;
    
    if (timeToExpiration <= refreshThresholdMs) {
      // Token expires soon, refresh immediately
      this.performRefresh();
    } else {
      // Schedule refresh for later
      const delayMs = timeToExpiration - refreshThresholdMs;
      this.scheduleRefresh(delayMs);
    }
  }

  /**
   * Stop monitoring and clear timers
   */
  public stopMonitoring(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.isRefreshing = false;
    this.retryCount = 0;
  }

  /**
   * Force an immediate refresh
   */
  public async forceRefresh(): Promise<void> {
    if (this.refreshCallback) {
      await this.performRefresh();
    }
  }

  /**
   * Add event listener for refresh events
   */
  public addEventListener(listener: (event: RefreshEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(listener: (event: RefreshEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Get configuration
   */
  public getConfig(): RefreshConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<RefreshConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if currently refreshing
   */
  public isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Get time to expiration in milliseconds
   */
  private getTimeToExpiration(jwtPayload: JWTPayload): number {
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = jwtPayload.exp;
    return (expirationTime - now) * 1000;
  }

  /**
   * Schedule a refresh after a delay
   */
  private scheduleRefresh(delayMs: number): void {
    this.emitEvent({
      type: 'refresh_scheduled',
      timestamp: new Date(),
      timeToExpiration: delayMs
    });

    this.refreshTimer = setTimeout(() => {
      this.performRefresh();
    }, delayMs);
  }

  /**
   * Perform the actual token refresh
   */
  private async performRefresh(): Promise<void> {
    if (this.isRefreshing || !this.refreshCallback) {
      return;
    }

    this.isRefreshing = true;
    
    this.emitEvent({
      type: 'refresh_started',
      timestamp: new Date(),
      retryCount: this.retryCount
    });

    try {
      await this.refreshCallback();
      
      this.emitEvent({
        type: 'refresh_success',
        timestamp: new Date(),
        retryCount: this.retryCount
      });
      
      // Reset retry count on success
      this.retryCount = 0;
    } catch (error) {
      this.emitEvent({
        type: 'refresh_failed',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: this.retryCount
      });

      // Retry logic
      this.retryCount++;
      if (this.retryCount < this.config.maxRetries) {
        setTimeout(() => {
          this.isRefreshing = false;
          this.performRefresh();
        }, this.config.retryDelayMs);
        return;
      } else {
        console.error('Token refresh failed after maximum retries:', error);
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: RefreshEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in refresh event listener:', error);
      }
    });
  }
}

/**
 * Hook for using token refresh manager in React components
 */
export function useTokenRefreshManager(config?: Partial<RefreshConfig>) {
  const [manager] = React.useState(() => new TokenRefreshManager(config));
  const [refreshEvents, setRefreshEvents] = React.useState<RefreshEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    const handleRefreshEvent = (event: RefreshEvent) => {
      setRefreshEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
      setIsRefreshing(event.type === 'refresh_started');
    };

    manager.addEventListener(handleRefreshEvent);

    return () => {
      manager.removeEventListener(handleRefreshEvent);
      manager.stopMonitoring();
    };
  }, [manager]);

  return {
    manager,
    refreshEvents,
    isRefreshing,
    startMonitoring: manager.startMonitoring.bind(manager),
    stopMonitoring: manager.stopMonitoring.bind(manager),
    forceRefresh: manager.forceRefresh.bind(manager),
    updateConfig: manager.updateConfig.bind(manager),
    getConfig: manager.getConfig.bind(manager)
  };
}

/**
 * React component for displaying refresh status and controls
 */
interface TokenRefreshStatusProps {
  manager: TokenRefreshManager;
  showControls?: boolean;
  showEvents?: boolean;
}

export function TokenRefreshStatus({ 
  manager, 
  showControls = false, 
  showEvents = false 
}: TokenRefreshStatusProps) {
  const [refreshEvents, setRefreshEvents] = React.useState<RefreshEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [config, setConfig] = React.useState(manager.getConfig());

  React.useEffect(() => {
    const handleRefreshEvent = (event: RefreshEvent) => {
      setRefreshEvents(prev => [event, ...prev.slice(0, 9)]);
      setIsRefreshing(event.type === 'refresh_started');
    };

    manager.addEventListener(handleRefreshEvent);
    setIsRefreshing(manager.isCurrentlyRefreshing());

    return () => {
      manager.removeEventListener(handleRefreshEvent);
    };
  }, [manager]);

  const updateRefreshThreshold = (minutes: number) => {
    const newConfig = { ...config, refreshThresholdMinutes: minutes };
    manager.updateConfig(newConfig);
    setConfig(newConfig);
  };

  const getEventIcon = (type: RefreshEvent['type']) => {
    switch (type) {
      case 'refresh_started': return '🔄';
      case 'refresh_success': return '✅';
      case 'refresh_failed': return '❌';
      case 'refresh_scheduled': return '⏰';
      default: return '📄';
    }
  };

  const getEventColor = (type: RefreshEvent['type']) => {
    switch (type) {
      case 'refresh_started': return 'text-blue-600';
      case 'refresh_success': return 'text-green-600';
      case 'refresh_failed': return 'text-red-600';
      case 'refresh_scheduled': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Token Refresh Status</h3>
        <div className="flex items-center space-x-2">
          {isRefreshing && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🔄 Refreshing...
            </span>
          )}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            config.enableProactiveRefresh 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {config.enableProactiveRefresh ? '✅ Enabled' : '❌ Disabled'}
          </span>
        </div>
      </div>

      {/* Configuration */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Configuration</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Refresh Threshold:</span>
            <span className="ml-2 font-medium">{config.refreshThresholdMinutes} minutes</span>
          </div>
          <div>
            <span className="text-gray-600">Max Retries:</span>
            <span className="ml-2 font-medium">{config.maxRetries}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Controls</h4>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => manager.forceRefresh()}
              disabled={isRefreshing}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Force Refresh
            </button>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Threshold (min):</label>
              <select
                value={config.refreshThresholdMinutes}
                onChange={(e) => updateRefreshThreshold(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Recent Events */}
      {showEvents && refreshEvents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Recent Events ({refreshEvents.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {refreshEvents.map((event, index) => (
              <div key={index} className="flex items-start justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span>{getEventIcon(event.type)}</span>
                  <div>
                    <span className={`text-sm font-medium ${getEventColor(event.type)}`}>
                      {event.type.replace('_', ' ').toUpperCase()}
                    </span>
                    {event.error && (
                      <p className="text-xs text-red-600 mt-1">{event.error}</p>
                    )}
                    {event.retryCount !== undefined && event.retryCount > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Retry #{event.retryCount}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Events Message */}
      {showEvents && refreshEvents.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No refresh events yet
        </div>
      )}
    </div>
  );
}

export default TokenRefreshManager;