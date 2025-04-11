// components/appointments/AppointmentCalendar.js
"use client";

import { useState, useEffect } from 'react';
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
  const renderHeader = () => {
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
  };

  // Function to render the days of the week
  const renderDays = () => {
    const dateFormat = "EEE";
    const days = [];
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="w-full py-2 text-center text-sm font-medium text-gray-600" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7">{days}</div>;
  };

  // Function to render the cells for month view
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = startOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        
        // Find appointments for this day
        const dayAppointments = appointments.filter(appointment => 
          isSameDay(parseISO(appointment.scheduled_time), day)
        );
        
        days.push(
          <div
            key={day.toString()}
            className={`h-32 border border-gray-200 p-1 ${
              !isSameMonth(day, monthStart)
                ? "bg-gray-50 text-gray-400"
                : isSameDay(day, selectedDate)
                ? "bg-blue-50 border-blue-500"
                : ""
            } cursor-pointer`}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm ${
                isSameDay(day, new Date()) ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""
              }`}>
                {formattedDate}
              </span>
              {dayAppointments.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  {dayAppointments.length}
                </span>
              )}
            </div>
            <div className="mt-1 overflow-y-auto max-h-24">
              {dayAppointments.slice(0, 3).map((appointment, index) => (
                <div 
                  key={appointment.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentSelect(appointment);
                  }}
                  className={`text-xs p-1 mb-1 rounded truncate ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : appointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800 line-through'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  <div className="flex items-center">
                    {appointment.appointment_type === 'video_consultation' ? (
                      <FaVideo className="mr-1 h-2 w-2" />
                    ) : (
                      <FaUserMd className="mr-1 h-2 w-2" />
                    )}
                    <span>{format(parseISO(appointment.scheduled_time), 'h:mm a')}</span>
                  </div>
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-blue-600">
                  + {dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="flex-1">{rows}</div>;
  };

  // Function to render week view
  const renderWeekView = () => {
    const startDate = startOfWeek(selectedDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(startDate, i);
      const dayAppointments = appointments.filter(appointment => 
        isSameDay(parseISO(appointment.scheduled_time), currentDay)
      );
      
      days.push(
        <div key={i} className="flex-1 min-w-0 border-r border-gray-200 last:border-r-0">
          <div className={`text-center py-2 ${
            isSameDay(currentDay, new Date()) 
              ? "bg-blue-500 text-white" 
              : isSameDay(currentDay, selectedDate)
              ? "bg-blue-50"
              : ""
          }`}>
            <p className="text-sm font-medium">{format(currentDay, 'EEE')}</p>
            <p className="text-lg">{format(currentDay, 'd')}</p>
          </div>
          
          <div className="px-1 py-2 space-y-1 h-96 overflow-y-auto">
            {dayAppointments.length === 0 ? (
              <div className="text-center text-sm text-gray-400 mt-4">
                No appointments
              </div>
            ) : (
              dayAppointments.map(appointment => (
                <div 
                  key={appointment.id}
                  onClick={() => onAppointmentSelect(appointment)}
                  className={`p-2 rounded text-sm cursor-pointer ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-50 border border-green-200' 
                      : appointment.status === 'cancelled'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="font-medium">
                    {format(parseISO(appointment.scheduled_time), 'h:mm a')}
                  </div>
                  
                  <div className="flex items-center mt-1">
                    {appointment.appointment_type === 'video_consultation' ? (
                      <FaVideo className="mr-1 h-3 w-3 text-blue-500" />
                    ) : (
                      <FaUserMd className="mr-1 h-3 w-3 text-blue-500" />
                    )}
                    <span className="text-xs truncate">
                      {appointment.appointment_type === 'video_consultation'
                        ? 'Video Consultation'
                        : appointment.appointment_type === 'phone_consultation'
                        ? 'Phone Consultation'
                        : 'Office Visit'}
                    </span>
                  </div>
                  
                  {appointment.provider_details && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      Dr. {appointment.provider_details.first_name} {appointment.provider_details.last_name}
                    </div>
                  )}
                  
                  <div className="flex mt-1 justify-between items-center">
                    {appointment.status === 'confirmed' ? (
                      <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded flex items-center">
                        <FaCheck className="h-2 w-2 mr-1" />
                        Confirmed
                      </span>
                    ) : appointment.status === 'cancelled' ? (
                      <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded flex items-center">
                        <FaExclamationTriangle className="h-2 w-2 mr-1" />
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex">
        {days}
      </div>
    );
  };

  const onDateClick = (day) => {
    setSelectedDate(day);
    if (onDateSelect) {
      onDateSelect(day);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

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

export default AppointmentCalendar;
