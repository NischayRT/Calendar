const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const detectConflicts = (events) => {
  if (!events.length) return { events: [], totalLanes: 0 };
  
  const sorted = [...events].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  
  const lanes = [];
  
  sorted.forEach(event => {
    const eventStart = timeToMinutes(event.startTime);
    const eventEnd = timeToMinutes(event.endTime);
    
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

export const processEvents = (events) => {
  const grouped = {};
  
  events.forEach(event => {
    if (!grouped[event.date]) {
      grouped[event.date] = [];
    }
    grouped[event.date].push({ ...event });
  });
  
  Object.keys(grouped).forEach(date => {
    grouped[date] = detectConflicts(grouped[date]);
  });
  
  return grouped;
};