'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Event } from '@/types';
import BookingModal from '@/components/BookingModal';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events/');
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events");
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleBookingConfirm = async (guestData?: { name: string; email: string }) => {
    if (!selectedEvent) return;

    try {
      const payload: any = { event_id: selectedEvent.id };
      
      if (guestData) {
        payload.guest_name = guestData.name;
        payload.guest_email = guestData.email;
      }

      await api.post('/bookings/', payload);
      
      alert("✅ Booking Successful! Check your email.");
      setIsModalOpen(false);
      fetchEvents();
      
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.detail || "Booking failed"}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Upcoming Events 📅
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Discover amazing events happening in Munich
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎪</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No events yet</h2>
            <p className="text-gray-500">Be the first to create an event!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Card Header with gradient */}
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
                <div className="p-5 sm:p-6">
                  {/* Title & Price */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 flex-1">
                      {event.title}
                    </h2>
                    <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                      event.price === 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {event.price === 0 ? 'FREE' : `€${event.price}`}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  {/* Event Details */}
                  <div className="space-y-2 text-sm mb-5">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>📍</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>⏰</span>
                      <span>
                        {new Date(event.date).toLocaleDateString('en-DE', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 font-medium ${
                      event.available_tickets < 5 
                        ? 'text-red-600' 
                        : event.available_tickets < 20 
                          ? 'text-orange-500' 
                          : 'text-green-600'
                    }`}>
                      <span>🎫</span>
                      <span>
                        {event.available_tickets === 0 
                          ? 'Sold Out!' 
                          : `${event.available_tickets} tickets left`}
                      </span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={() => openBookingModal(event)}
                    disabled={event.available_tickets === 0}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                      event.available_tickets === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
                    }`}
                  >
                    {event.available_tickets === 0 ? 'Sold Out' : 'Book Ticket'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {selectedEvent && (
          <BookingModal 
            isOpen={isModalOpen} 
            closeModal={() => setIsModalOpen(false)} 
            onConfirm={handleBookingConfirm}
            eventTitle={selectedEvent.title}
          />
        )}
      </div>
    </div>
  );
}