import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  X,
  Plus,
  Trash2,
} from "lucide-react";

// ============================================================================
// UTILS - dateHelpers.js
// ============================================================================
const dateHelpers = {
  getDaysInMonth: (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  },

  getFirstDayOfMonth: (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  },

  addMonths: (date, amount) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + amount);
    return newDate;
  },

  addYears: (date, amount) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + amount);
    return newDate;
  },

  isSameDay: (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  },

  format: (date, formatStr) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const formats = {
      "yyyy-MM-dd": `${year}-${month}-${day}`,
      "MMMM yyyy": (() => {
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return `${monthNames[date.getMonth()]} ${year}`;
      })(),
      "MMMM d, yyyy": (() => {
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${year}`;
      })(),
      EEEE: (() => {
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        return dayNames[date.getDay()];
      })(),
    };

    return formats[formatStr] || date.toString();
  },
};

// ============================================================================
// UTILS - eventHelpers.js
// ============================================================================
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const detectConflicts = (events) => {
  if (!events.length) return { events: [], totalLanes: 0 };

  const sorted = [...events].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const lanes = [];

  sorted.forEach((event) => {
    const eventStart = timeToMinutes(event.startTime);
    // const eventEnd = timeToMinutes(event.endTime); // Unused variable removed

    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];
      const lastEvent = lane[lane.length - 1];
      const lastEnd = timeToMinutes(lastEvent.endTime);

      if (eventStart >= lastEnd) {
        lane.push(event);
        event.lane = i;
        placed = true;
        break;
      }
    }

    if (!placed) {
      event.lane = lanes.length;
      lanes.push([event]);
    }
  });

  return { events: sorted, totalLanes: lanes.length };
};

const processEvents = (events) => {
  const grouped = {};

  events.forEach((event) => {
    if (!grouped[event.date]) {
      grouped[event.date] = [];
    }
    grouped[event.date].push({ ...event });
  });

  Object.keys(grouped).forEach((date) => {
    grouped[date] = detectConflicts(grouped[date]);
  });

  return grouped;
};

// ============================================================================
// DATA - Preset colors
// ============================================================================
const PRESET_COLORS = [
  "#f6be23",
  "#4a90e2",
  "#9b59b6",
  "#e24a90",
  "#50c878",
  "#f6501e",
  "#3498db",
  "#e67e22",
  "#16a085",
  "#c0392b",
  "#8e44ad",
  "#27ae60",
];

// ============================================================================
// COMPONENT - Add Event Form
// ============================================================================
const AddEventForm = ({ date, onAdd, onCancel }) => {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        startTime,
        endTime,
        color,
        date,
      });
      setTitle("");
      setStartTime("09:00");
      setEndTime("10:00");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-indigo-200"
    >
      <h4 className="font-semibold text-gray-900 mb-3">Add New Event</h4>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  color === presetColor
                    ? "ring-2 ring-gray-900 scale-110"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            Add Event
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

// ============================================================================
// COMPONENT - Month Picker Modal
// ============================================================================
const MonthPickerModal = ({ currentDate, onSelectMonth, onClose }) => {
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(selectedYear, monthIndex, 1);
    onSelectMonth(newDate);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-6 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-white"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-xl font-bold text-gray-900">{selectedYear}</h3>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors  bg-white"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => {
            const isCurrentMonth =
              index === currentDate.getMonth() &&
              selectedYear === currentDate.getFullYear();

            return (
              <button
                key={month}
                onClick={() => handleMonthSelect(index)}
                className={`
                  py-3 px-4 rounded-lg font-medium transition-all
                  ${
                    isCurrentMonth
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {month}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT - Day Detail Modal
// ============================================================================
const DayDetailModal = ({
  day,
  events,
  onClose,
  onAddEvent,
  onToggleComplete,
  onDeleteEvent,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  if (!day) return null;

  const dayDate = new Date(day.dateString);
  const dayEvents = events || { events: [], totalLanes: 0 };

  const handleAddEvent = (eventData) => {
    onAddEvent(eventData);
    setShowAddForm(false);
    onClose();
  };

  const handleDelete = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      onDeleteEvent(eventId);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-2xl font-bold">
              {dateHelpers.format(dayDate, "MMMM d, yyyy")}
            </h3>
            <p className="text-indigo-200 mt-1">
              {dateHelpers.format(dayDate, "EEEE")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
              title="Add Event"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="p-6 overflow-y-auto flex-1">
          {showAddForm && (
            <AddEventForm
              date={day.dateString}
              onAdd={handleAddEvent}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {dayEvents.events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                No events scheduled for this day
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.events.map((event) => (
                <div
                  key={event.id}
                  className="border-l-4 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  style={{ borderColor: event.color }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={event.completed || false}
                      onChange={() => onToggleComplete(event.id)}
                      className="mt-1.5 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                    <div className="flex-1">
                      <h4
                        className={`font-semibold text-gray-900 text-lg mb-2 ${
                          event.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span
                          className={`text-sm font-medium ${
                            event.completed ? "line-through" : ""
                          }`}
                        >
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT - EventCard
// ============================================================================
const EventCard = ({ event, hasMultipleLanes }) => {
  return (
    <div
      className="group relative"
      style={{
        marginLeft: hasMultipleLanes ? `${event.lane * 3}px` : "0",
      }}
    >
      <div
        className={`text-xs px-2 py-1 rounded text-white truncate hover:shadow-md transition-all cursor-pointer ${
          event.completed ? "opacity-60" : ""
        }`}
        style={{
          backgroundColor: event.color,
          opacity: hasMultipleLanes ? 0.9 : 1,
        }}
        title={`${event.title}\n${event.startTime} - ${event.endTime}`}
      >
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span
            className={`font-medium truncate ${
              event.completed ? "line-through" : ""
            }`}
          >
            {event.title}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT - CalendarDay
// ============================================================================
const CalendarDay = ({ day, onClick }) => {
  if (!day.isValidDay) {
    return (
      <div className="h-full border-r border-b border-gray-200 bg-gray-50" />
    );
  }

  return (
    <div
      onClick={() => onClick(day)}
      className={`
        h-full border-r border-b border-gray-200 p-2 flex flex-col
        bg-white hover:bg-gray-50 cursor-pointer
        ${day.isCurrentDay ? "bg-blue-50" : ""}
        transition-colors
      `}
    >
      <div
        className={`
        text-sm font-medium mb-1.5
        ${
          day.isCurrentDay
            ? "bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full"
            : "text-gray-700"
        }
      `}
      >
        {day.dayNumber}
      </div>

      {day.events && (
        <div className="space-y-1 overflow-y-auto flex-1">
          {day.events.events.slice(0, 2).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              hasMultipleLanes={day.events.totalLanes > 1}
            />
          ))}

          {day.events.events.length > 2 && (
            <div className="text-xs text-gray-500 font-medium pl-2">
              +{day.events.events.length - 2} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT - Calendar (Main)
// ============================================================================
const Calendar = ({ events: initialEventsProp = [] }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // Initialize state with props
  const [events, setEvents] = useState(initialEventsProp);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with props if they change
  useEffect(() => {
    setEvents(initialEventsProp);
  }, [initialEventsProp]);

  const eventsByDate = useMemo(() => processEvents(events), [events]);

  const daysInMonth = dateHelpers.getDaysInMonth(currentDate);
  const firstDay = dateHelpers.getFirstDayOfMonth(currentDate);

  const handlePrevMonth = () => {
    if (isAnimating) return;
    setDirection(-1);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate(dateHelpers.addMonths(currentDate, -1));
      setIsAnimating(false);
    }, 300);
  };

  const handleNextMonth = () => {
    if (isAnimating) return;
    setDirection(1);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate(dateHelpers.addMonths(currentDate, 1));
      setIsAnimating(false);
    }, 300);
  };

  const handleToday = () => {
    if (isAnimating) return;
    setDirection(0);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate(new Date());
      setIsAnimating(false);
    }, 300);
  };

  const handleMonthSelect = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleDayClick = (day) => {
    const dateString = day.dateString;
    const updatedEvents = eventsByDate[dateString];
    setSelectedDay({
      ...day,
      events: updatedEvents,
    });
  };

  const handleAddEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now(),
      completed: false,
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    // Note: Changes won't persist to the file in a browser
  };

  const handleToggleComplete = (eventId) => {
    const updatedEvents = events.map((event) =>
      event.id === eventId ? { ...event, completed: !event.completed } : event
    );
    setEvents(updatedEvents);

    if (selectedDay) {
      const updatedEventsByDate = processEvents(updatedEvents);
      const updatedDayEvents = updatedEventsByDate[selectedDay.dateString];
      setSelectedDay({
        ...selectedDay,
        events: updatedDayEvents,
      });
    }
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);

    if (selectedDay) {
      const updatedEventsByDate = processEvents(updatedEvents);
      const updatedDayEvents = updatedEventsByDate[selectedDay.dateString];
      setSelectedDay({
        ...selectedDay,
        events: updatedDayEvents,
      });
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = useMemo(() => {
    const days = [];
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDay + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;

      if (isValidDay) {
        const cellDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          dayNumber
        );
        const dateString = dateHelpers.format(cellDate, "yyyy-MM-dd");
        const dayEvents = eventsByDate[dateString];
        const isCurrentDay = dateHelpers.isSameDay(cellDate, today);

        days.push({
          key: i,
          dayNumber,
          dateString,
          isValidDay: true,
          isCurrentDay,
          events: dayEvents,
        });
      } else {
        days.push({
          key: i,
          isValidDay: false,
        });
      }
    }

    return days;
  }, [currentDate, daysInMonth, firstDay, eventsByDate, today]);

  const getAnimationClass = () => {
    if (!isAnimating) return "opacity-100 translate-x-0";
    if (direction === 1) return "opacity-0 -translate-x-8";
    if (direction === -1) return "opacity-0 translate-x-8";
    return "opacity-0 scale-95";
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 bg-white shadow-lg border-b border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-7 h-7 text-indigo-600" />
              <button
                onClick={() => setShowMonthPicker(true)}
                className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors bg-white"
              >
                {dateHelpers.format(currentDate, "MMMM yyyy")}
              </button>
            </div>
            <button
              onClick={handleToday}
              disabled={isAnimating}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              disabled={isAnimating}
              className="p-2.5 text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              disabled={isAnimating}
              className="p-2.5 text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-t border-gray-200 bg-gray-50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-gray-700 py-3 uppercase tracking-wider border-r last:border-r-0 border-gray-200"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-in-out ${getAnimationClass()}`}
        >
          <div className="grid grid-cols-7 grid-rows-6 h-full border-l border-gray-200">
            {calendarDays.map((day) => (
              <CalendarDay key={day.key} day={day} onClick={handleDayClick} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer legend */}
      <div className="flex-shrink-0 px-6 py-3 bg-white border-t border-gray-200 text-xs text-gray-600 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="font-medium">Current day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-400"></div>
            <span className="font-medium">Overlapping events are offset</span>
          </div>
        </div>
      </div>
      {/* Month Picker Modal */}
      {showMonthPicker && (
        <MonthPickerModal
          currentDate={currentDate}
          onSelectMonth={handleMonthSelect}
          onClose={() => setShowMonthPicker(false)}
        />
      )}

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          events={selectedDay.events}
          onClose={() => setSelectedDay(null)}
          onAddEvent={handleAddEvent}
          onToggleComplete={handleToggleComplete}
          onDeleteEvent={handleDeleteEvent}
        />
      )}
    </div>
  );
};
export default Calendar;
