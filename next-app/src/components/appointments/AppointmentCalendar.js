// components/appointments/AppointmentCalendar.js
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

  // Rest of component implementation...
  // I'm truncating here but would keep the rest of the component logic

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

  // Rest of the component...

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