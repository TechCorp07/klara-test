// src/lib/auth/token-refresh-manager.tsx
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
  }

  /**
   * Force a refresh immediately
   */
  public forceRefresh(): void {
    if (!this.isRefreshing) {
      this.performRefresh();
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<RefreshConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): RefreshConfig {
    return { ...this.config };
  }

  /**
   * Add event listener
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
   * Check if currently refreshing
   */
  public isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Get time to expiration in milliseconds
   */
  private getTimeToExpiration(jwtPayload: JWTPayload): number {
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, (jwtPayload.exp - currentTime) * 1000);
  }

  /**
   * Schedule a refresh
   */
  private scheduleRefresh(delayMs: number): void {
    this.refreshTimer = setTimeout(() => {
      this.performRefresh();
    }, delayMs);

    this.emitEvent({
      type: 'refresh_scheduled',
      timestamp: new Date(),
      timeToExpiration: delayMs
    });
  }

  /**
   * Perform the actual refresh
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
            {config.enableProactiveRefresh ? '✓ Active' : '○ Disabled'}
          </span>
        </div>
      </div>

      {/* Configuration */}
      <div className="mb-4">
        <h4 className="text-md font-medium text-gray-700 mb-2">Configuration</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Refresh Interval:</span>
            <span className="text-sm font-medium ml-2">{config.refreshThresholdMinutes} minutes</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Max Retries:</span>
            <span className="text-sm font-medium ml-2">{config.maxRetries}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-700 mb-2">Controls</h4>
          <div className="space-y-3">
            <button
              onClick={() => manager.forceRefresh()}
              disabled={isRefreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Force Refresh
            </button>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Threshold (min):
              </label>
              <select
                value={config.refreshThresholdMinutes}
                onChange={(e) => updateRefreshThreshold(parseInt(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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

      {/* Events */}
      {showEvents && refreshEvents.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Recent Events</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {refreshEvents.map((event, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span className={`text-lg ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </span>
                  <span className="font-medium">{event.type.replace('_', ' ')}</span>
                </div>
                {event.error && (
                  <p className="text-red-600 text-xs">{event.error}</p>
                )}
                {event.retryCount !== undefined && event.retryCount > 0 && (
                  <p className="text-orange-600 text-xs">
                    Retry #{event.retryCount}
                  </p>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showEvents && refreshEvents.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">No refresh events yet.</p>
        </div>
      )}
    </div>
  );
}