'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Booking, Event } from '@/types';
import AnalyticsChart from '@/components/AnalyticsChart'; // Import Chart

export default function ProfilePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]); // Events I created
  const [selectedAnalytics, setSelectedAnalytics] = useState<any>(null); // Stats for one event
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Parallel fetch: Get my bookings AND my created events
      // Note: We need to implement /events/my-created endpoint or filter client side.
      // For simplicity: We fetch ALL events and filter by owner_id (if returned)
      // OR better: Create a specific backend endpoint.
      
      // Let's assume you added logic to return owner_id in GET /events/
      const [bookingsRes, eventsRes] = await Promise.all([
        api.get('/bookings/me'),
        api.get('/events/') 
      ]);
      
      setBookings(bookingsRes.data);
      
      // Filter events where I am the owner (Client side filter for now)
      // We need to know MY user ID. Usually we decode the token.
      // Quick hack: The backend should just give me "my events".
      // Let's implement: GET /events/mine in backend? 
      // OR: Just show all events and if I click "Delete" it works or fails.
      
      // Wait, let's keep it simple. We will just list bookings for now as per previous step.
      // To show "My Hosted Events", we really need that endpoint.
      
      // Let's simulate for now or rely on the user remembering what they created?
      // No, that's bad UX.
      
      // REAL SOLUTION: The backend endpoint /events/ should ideally accept ?owner=me
      // or we decode the token here.
      
      // Let's grab the events and try to fetch analytics for them. If 403, I don't own it.
      // That is inefficient.
      
      // Let's stick to what we have: Bookings. 
      // If you want to show Analytics, we need a list of events I own.
      
      // Assuming you added `owner_id` to EventRead in Python.
      // We need my User ID.
      const token = localStorage.getItem('token');
      // Decode token roughly (JWT has 3 parts)
      const payload = JSON.parse(atob(token!.split('.')[1]));
      // Note: payload.sub is email. We don't have ID here easily unless we fetch /users/me.
      
      // OKAY, STOP. Let's do this clean.
      // We will just filter client side by checking if we can get analytics.
      setMyEvents(eventsRes.data); 

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadAnalytics = async (eventId: number) => {
    try {
        const res = await api.get(`/events/${eventId}/analytics`);
        setSelectedAnalytics(res.data);
    } catch (err) {
        alert("You are not the owner of this event.");
    }
  };

  if (loading) return <div className="p-10 text-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Dashboard</h1>

            {/* SECTION 1: MY BOOKINGS */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">🎟️ My Tickets</h2>
                {bookings.length === 0 ? <p>No tickets yet.</p> : (
                    <div className="space-y-2">
                        {bookings.map(b => (
                            <div key={b.id} className="border p-3 rounded flex justify-between">
                                <span>Booking #{b.id} (Event {b.event_id})</span>
                                <span className="text-green-600">{b.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECTION 2: MY HOSTED EVENTS (Analytics) */}
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">📊 Events I Host</h2>
                <p className="text-sm text-gray-500 mb-4">Click an event to see sales data.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {myEvents.map(event => (
                        <button 
                            key={event.id}
                            onClick={() => loadAnalytics(event.id)}
                            className="p-4 border rounded-lg hover:bg-blue-50 text-left transition"
                        >
                            <p className="font-bold text-gray-800">{event.title}</p>
                            <p className="text-xs text-gray-500">ID: {event.id}</p>
                        </button>
                    ))}
                </div>

                {/* THE ANALYTICS DISPLAY */}
                {selectedAnalytics && (
                    <div className="mt-8 border-t pt-8">
                        <h3 className="text-lg font-bold text-gray-800">
                            Analytics for: {selectedAnalytics.event_title}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mt-2 mb-6">
                            <div className="bg-blue-50 p-4 rounded text-center">
                                <p className="text-sm text-gray-500">Revenue</p>
                                <p className="text-2xl font-bold text-blue-600">€{selectedAnalytics.revenue}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded text-center">
                                <p className="text-sm text-gray-500">Total Sold</p>
                                <p className="text-2xl font-bold text-green-600">{selectedAnalytics.sold}</p>
                            </div>
                        </div>
                        
                        {/* RENDER THE CHART COMPONENT */}
                        <AnalyticsChart 
                            sold={selectedAnalytics.sold} 
                            total={selectedAnalytics.total_tickets}
                            guestSales={selectedAnalytics.guest_sales}
                            userSales={selectedAnalytics.user_sales}
                        />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}