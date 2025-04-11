// components/appointments/AppointmentCalendar.jsx
"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, 
         isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaVideo, 
         FaUserMd, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

/**
 * Calendar component for displaying and managing appointments
 * @param {Object} props
 * @param {Array} props.appointments - List of appointment objects
 * @param {Function} props.onDateSelect - Callback when a date is selected
 * @param {Function} props.onAppointmentSelect - Callback when an appointment is selected
 */
const AppointmentCalendar = ({ appointments = [], onDateSelect, onAppointmentSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month'); // 'month' or 'week'

  // Function to render the header with month and navigation
  const renderHeader = useCallback(() => {
    const dateFormat = "MMMM yyyy";

    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaCalendarAlt className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-lg font-bold text-gray-800">
            {format(currentMonth, dateFormat)}
          </span>
        </div>
        <div className="flex space-x-2">
          <select
            value={calendarView}
            onChange={(e) => setCalendarView(e.target.value)}
            className="mr-4 bg-white border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
          </select>
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Previous Month"
          >
            <FaChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Next Month"
          >
            <FaChevronRight className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="ml-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
          >
            Today
          </button>
        </div>
      </div>
    );
  }, [currentMonth, calendarView]);

  // Function to render the days of the week
  const renderDays = useCallback(() => {
    const dateFormat = "EEEE";
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col-span-1 text-center text-sm font-medium text-gray-500 py-1" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-1 mb-2">{days}</div>;
  }, [currentMonth]);

  // Function to render the calendar cells
  const renderCells = useCallback(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfMonth(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        
        // Find appointments for this day
        const dayAppointments = appointments.filter(appointment =>
          isSameDay(parseISO(appointment.scheduled_time), day)
        );

        days.push(
          <div
            key={i}
            className={`col-span-1 p-2 min-h-[100px] border rounded-md 
              ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} 
              ${isToday ? 'border-blue-300' : 'border-gray-200'} 
              ${isSelected ? 'ring-2 ring-blue-500' : ''}
              hover:bg-blue-50 cursor-pointer transition-colors`}
            onClick={() => onDateClick(day)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`
                text-sm font-medium 
                ${isToday ? 'bg-blue-500 text-white rounded-full px-2 py-0.5' : ''}
              `}>
                {formattedDate}
              </span>
              {dayAppointments.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  {dayAppointments.length}
                </span>
              )}
            </div>
            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map(appointment => (
                <div 
                  key={appointment.id}
                  className={`text-xs p-1 rounded truncate ${getAppointmentTypeStyle(appointment.appointment_type)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentSelect && onAppointmentSelect(appointment);
                  }}
                >
                  {format(parseISO(appointment.scheduled_time), 'h:mm a')} - {appointment.reason || 'Appointment'}
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-gray-500 pl-1">
                  + {dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  }, [appointments, currentMonth, selectedDate]);

  // Function to render week view
  const renderWeekView = useCallback(() => {
    const startDate = startOfWeek(selectedDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(startDate, i);
      const dayAppointments = appointments.filter(appointment =>
        isSameDay(parseISO(appointment.scheduled_time), currentDay)
      );
      
      days.push(
        <div key={i} className="border rounded-md bg-white mb-2 overflow-hidden">
          <div className={`p-2 font-medium text-sm ${
            isSameDay(currentDay, new Date()) ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}>
            {format(currentDay, 'EEEE, MMMM d')}
          </div>
          <div className="divide-y divide-gray-100">
            {dayAppointments.length > 0 ? (
              dayAppointments.map(appointment => (
                <div 
                  key={appointment.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onAppointmentSelect && onAppointmentSelect(appointment)}
                >
                  <div className="flex items-center">
                    <div className={`w-1 h-10 rounded-full mr-3 ${
                      getAppointmentStatusColor(appointment.status)
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-sm">
                          {format(parseISO(appointment.scheduled_time), 'h:mm a')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getAppointmentTypeLabel(appointment.appointment_type)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 truncate">{appointment.reason || 'Appointment'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No appointments scheduled
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return <div>{days}</div>;
  }, [appointments, selectedDate]);

  // Helper function to get appointment type style
  const getAppointmentTypeStyle = (type) => {
    switch (type) {
      case 'video_consultation':
        return 'bg-blue-50 text-blue-700';
      case 'phone_consultation':
        return 'bg-green-50 text-green-700';
      case 'in_person':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  // Helper function to get appointment status color
  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Helper function to get appointment type label
  const getAppointmentTypeLabel = (type) => {
    switch (type) {
      case 'video_consultation':
        return 'Video';
      case 'phone_consultation':
        return 'Phone';
      case 'in_person':
        return 'In-person';
      default:
        return 'Appointment';
    }
  };

  const onDateClick = useCallback((day) => {
    setSelectedDate(day);
    if (onDateSelect) {
      onDateSelect(day);
    }
  }, [onDateSelect]);

  const nextMonth = useCallback(() => {
    setCurrentMonth(addMonths(currentMonth, 1));
  }, [currentMonth]);

  const prevMonth = useCallback(() => {
    setCurrentMonth(subMonths(currentMonth, 1));
  }, [currentMonth]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        {renderHeader()}
        {calendarView === 'month' ? (
          <>
            {renderDays()}
            {renderCells()}
          </>
        ) : (
          renderWeekView()
        )}
      </div>
    </div>
  );
};

export default memo(AppointmentCalendar);
