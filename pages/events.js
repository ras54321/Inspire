import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import EventsCalendar from '../components/UI/EventsCalendar';
import { createEvent, getEvents, deleteEvent, rsvpEvent, cancelRsvp } from '../lib/events';
import toast from 'react-hot-toast';

const EventsPage = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  useEffect(() => {
    connectWallet();
    loadEvents();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setCurrentAccount(account);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const loadEvents = () => {
    const loadedEvents = getEvents();
    setEvents(loadedEvents);
  };

  const handleEventCreate = (newEvent) => {
    const createdEvent = createEvent(newEvent);
    if (createdEvent) {
      loadEvents();
      toast.success('Event created successfully!');
    } else {
      toast.error('Failed to create event');
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEventDelete = (eventId) => {
    if (deleteEvent(eventId)) {
      loadEvents();
      setShowEventDetails(false);
      toast.success('Event deleted successfully!');
    } else {
      toast.error('Failed to delete event');
    }
  };

  const handleRsvp = () => {
    if (!currentAccount || !selectedEvent) return;

    const rsvps = selectedEvent.rsvps || [];
    const hasRsvped = rsvps.includes(currentAccount);

    if (hasRsvped) {
      if (cancelRsvp(selectedEvent.id, currentAccount)) {
        loadEvents();
        setSelectedEvent(prev => ({
          ...prev,
          rsvps: prev.rsvps.filter(addr => addr !== currentAccount)
        }));
        toast.success('RSVP canceled');
      } else {
        toast.error('Failed to cancel RSVP');
      }
    } else {
      if (rsvpEvent(selectedEvent.id, currentAccount)) {
        loadEvents();
        setSelectedEvent(prev => ({
          ...prev,
          rsvps: [...(prev.rsvps || []), currentAccount]
        }));
        toast.success('RSVP successful!');
      } else {
        toast.error('Failed to RSVP');
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📅 Events Calendar</h1>
            {currentAccount && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connected: {currentAccount.substring(0, 6)}...{currentAccount.substring(38)}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <EventsCalendar
              events={events}
              onEventClick={handleEventClick}
              onEventCreate={handleEventCreate}
            />
          </div>

          {/* Event Details / Upcoming Events */}
          <div className="lg:col-span-1">
            {showEventDetails && selectedEvent ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedEvent.title}
                  </h3>
                  <button
                    onClick={() => setShowEventDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="mr-2">📅</span>
                    <span>{formatDate(selectedEvent.date)}</span>
                  </div>
                  
                  {selectedEvent.description && (
                    <div className="text-gray-600 dark:text-gray-400">
                      {selectedEvent.description}
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="mr-2">👥</span>
                    <span>{(selectedEvent.rsvps || []).length} RSVPs</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentAccount && (
                    <button
                      onClick={handleRsvp}
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        (selectedEvent.rsvps || []).includes(currentAccount)
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      }`}
                    >
                      {(selectedEvent.rsvps || []).includes(currentAddress) 
                        ? 'Cancel RSVP' 
                        : 'RSVP'}
                    </button>
                  )}
                  
                  {selectedEvent.createdAt && (
                    <button
                      onClick={() => handleEventDelete(selectedEvent.id)}
                      className="w-full py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 font-medium transition-colors"
                    >
                      Delete Event
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Upcoming Events
                </h3>
                
                {events.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No events yet. Click on a date to create one!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {events
                      .filter(event => new Date(event.date) >= new Date())
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .slice(0, 5)
                      .map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(event.date)}
                          </p>
                          <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="mr-1">👥</span>
                            <span>{(event.rsvps || []).length} RSVPs</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventsPage;
