// src/components/ui/NotificationsPanel.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRealTimeAlerts } from '@/hooks/useDashboard';
import { Bell, X, Calendar, Pill, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export default function NotificationsPanel({ isOpen, onClose, triggerRef }: NotificationsPanelProps) {
  const { alerts, markAsRead } = useRealTimeAlerts();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-4 h-4 text-blue-500" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'health':
        return <Activity className="w-4 h-4 text-red-500" />;
      case 'research':
        return <AlertTriangle className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{alerts.length} items</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">All caught up!</p>
            <p className="text-xs text-gray-400">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-2 ${getSeverityColor(alert.severity)}`}
                onClick={() => {
                  markAsRead(alert.id);
                  if (alert.action_url) {
                    window.location.href = alert.action_url;
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {alert.title}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTime(alert.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.message}
                    </p>
                    {alert.action_required && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-2">
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <Link
            href="/notifications"
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}