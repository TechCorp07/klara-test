// src/app/(dashboard)/patient/components/dashboard/TelemedicineMeetingInfo.tsx
'use client';

import React, { useState } from 'react';
import { Video, Copy, ExternalLink, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Appointment } from '@/types/patient.types';

interface TelemedicineMeetingInfoProps {
  appointment: Appointment;
  compact?: boolean; // For widget vs full page display
}

export function TelemedicineMeetingInfo({ appointment, compact = false }: TelemedicineMeetingInfoProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!appointment.is_telemedicine && !['video_consultation', 'phone_consultation'].includes(appointment.appointment_type)) {
    return null;
  }

  const handleCopyLink = async () => {
    if (appointment.meeting_url) {
      try {
        await navigator.clipboard.writeText(appointment.meeting_url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const getMinutesUntilStart = (): number => {
    return Math.max(0, Math.floor((new Date(appointment.scheduled_time).getTime() - new Date().getTime()) / (1000 * 60)));
  };

  const canJoinNow = (): boolean => {
    const minutesUntil = getMinutesUntilStart();
    return minutesUntil <= 15; // Allow joining 15 minutes before
  };

  const isAppointmentSoon = (): boolean => {
    const minutesUntil = getMinutesUntilStart();
    return minutesUntil <= 30;
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center mb-3">
        <Video className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className={`font-semibold text-blue-900 ${compact ? 'text-sm' : ''}`}>
          Telemedicine Meeting
        </h3>
        {appointment.telemedicine_ready ? (
          <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
        ) : (
          <AlertCircle className="w-4 h-4 text-yellow-600 ml-2" />
        )}
      </div>

      {appointment.meeting_url ? (
        <div className="space-y-3">
          {/* Meeting Status */}
          {!compact && (
            <div className="text-sm">
              {canJoinNow() ? (
                <div className="flex items-center text-green-700 bg-green-50 px-2 py-1 rounded">
                  <Clock className="w-4 h-4 mr-1" />
                  Ready to join now
                </div>
              ) : isAppointmentSoon() ? (
                <div className="flex items-center text-orange-700 bg-orange-50 px-2 py-1 rounded">
                  <Clock className="w-4 h-4 mr-1" />
                  Starts in {getMinutesUntilStart()} minutes
                </div>
              ) : (
                <div className="flex items-center text-blue-700">
                  <Calendar className="w-4 h-4 mr-1" />
                  Meeting scheduled
                </div>
              )}
            </div>
          )}

          {/* Meeting Details */}
          <div className="bg-white p-3 rounded border">
            <div className={`grid grid-cols-1 gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
              {appointment.meeting_id && !compact && (
                <div>
                  <span className="font-medium text-gray-700">Meeting ID:</span>
                  <span className="ml-2 font-mono text-gray-600">{appointment.meeting_id}</span>
                </div>
              )}
              
              <div>
                <span className="font-medium text-gray-700">Join URL:</span>
                <div className="mt-1 flex items-center space-x-2">
                  {compact ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={handleCopyLink}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                        title="Copy meeting link"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      
                      <a
                        href={appointment.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={appointment.meeting_url}
                        readOnly
                        className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded truncate"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                        title="Copy meeting link"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <a
              href={appointment.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded font-medium ${compact ? 'text-xs' : 'text-sm'} ${
                canJoinNow() 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ExternalLink className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
              {canJoinNow() ? 'Join Now' : 'Open Meeting'}
            </a>
          </div>

          {/* Additional Info - only show in full view */}
          {!compact && (
            <div className="text-xs text-gray-600 space-y-1">
              <p>• You can join up to 15 minutes before the scheduled time</p>
              <p>• Make sure your camera and microphone are working</p>
              <p>• Meeting details have been sent to your email</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>Meeting setup in progress</p>
          {!compact && (
            <p className="text-xs text-gray-500 mt-1">
              Meeting details will be available shortly and sent to your email
            </p>
          )}
        </div>
      )}
    </div>
  );
}