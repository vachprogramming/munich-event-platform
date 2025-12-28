'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Event } from '@/types';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Fetch events when the page loads
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/');
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 2. Handle Booking Logic
  const handleBook = async (eventId: number) => {
    try {
      if (!confirm("Confirm booking for this event?")) return;

      await api.post('/bookings/', { event_id: eventId });
      
      alert("✅ Booking Successful! Check your email.");
      
      // Refresh the page to update "available tickets" count
      window.location.reload();
      
    } catch (error: any) {
      // Show the specific error from the backend (e.g., "Sold Out")
      const message = error.response?.data?.detail || "Booking failed";
      alert(`❌ Error: ${message}`);
    }
  };

  if (loading) return <div className="p-10 text-center text-black">Loading events...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Upcoming Events 📅</h1>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="text-red-600 hover:text-red-800 text-sm font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {event.price === 0 ? 'FREE' : `€${event.price}`}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p>📍 {event.location}</p>
                  <p>⏰ {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  <p className={event.available_tickets < 5 ? "text-red-600 font-bold" : "text-green-600"}>
                    🎫 {event.available_tickets} tickets left
                  </p>
                </div>

                <button
                  onClick={() => handleBook(event.id)}
                  disabled={event.available_tickets === 0}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                    event.available_tickets === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {event.available_tickets === 0 ? 'Sold Out' : 'Book Ticket'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}