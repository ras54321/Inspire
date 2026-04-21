// Events management functions using localStorage

export const createEvent = (event) => {
  try {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    
    const newEvent = {
      ...event,
      id: event.id || Date.now().toString(),
      createdAt: event.createdAt || Date.now(),
    };
    
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    
    return newEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};

export const updateEvent = (eventId, updates) => {
  try {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const eventIndex = events.findIndex(event => event.id === eventId);
    
    if (eventIndex !== -1) {
      events[eventIndex] = { ...events[eventIndex], ...updates };
      localStorage.setItem('events', JSON.stringify(events));
      return events[eventIndex];
    }
    
    return null;
  } catch (error) {
    console.error('Error updating event:', error);
    return null;
  }
};

export const deleteEvent = (eventId) => {
  try {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const filteredEvents = events.filter(event => event.id !== eventId);
    localStorage.setItem('events', JSON.stringify(filteredEvents));
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

export const getEvents = () => {
  try {
    return JSON.parse(localStorage.getItem('events') || '[]');
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
};

export const getEventById = (eventId) => {
  try {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    return events.find(event => event.id === eventId) || null;
  } catch (error) {
    console.error('Error getting event by ID:', error);
    return null;
  }
};

export const getEventsByDate = (date) => {
  try {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  } catch (error) {
    console.error('Error getting events by date:', error);
    return [];
  }
};

export const getEventsByMonth = (year, month) => {
  try {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  } catch (error) {
    console.error('Error getting events by month:', error);
    return [];
  }
};

export const rsvpEvent = (eventId, userAddress) => {
  try {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const eventIndex = events.findIndex(event => event.id === eventId);
    
    if (eventIndex !== -1) {
      const event = events[eventIndex];
      const rsvps = event.rsvps || [];
      
      if (!rsvps.includes(userAddress)) {
        rsvps.push(userAddress);
        events[eventIndex] = { ...event, rsvps };
        localStorage.setItem('events', JSON.stringify(events));
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    return false;
  }
};

export const cancelRsvp = (eventId, userAddress) => {
  try {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const eventIndex = events.findIndex(event => event.id === eventId);
    
    if (eventIndex !== -1) {
      const event = events[eventIndex];
      const rsvps = event.rsvps || [];
      
      const updatedRsvps = rsvps.filter(addr => addr !== userAddress);
      events[eventIndex] = { ...event, rsvps: updatedRsvps };
      localStorage.setItem('events', JSON.stringify(events));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error canceling RSVP:', error);
    return false;
  }
};
