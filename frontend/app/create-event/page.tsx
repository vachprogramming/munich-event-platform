'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function CreateEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // We use a simple state object, NOT FormData
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '', // Will be a string like "2025-10-20T18:00"
    total_tickets: 10,
    price: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Format the date to ISO format if needed (HTML datetime-local is close enough usually)
      // Backend expects: "2025-10-20T18:00:00"
      const payload = {
        ...form,
        total_tickets: Number(form.total_tickets), // Ensure number
        price: Number(form.price), // Ensure number
        date: new Date(form.date).toISOString() // Convert to strict ISO format
      };

      console.log("Sending Payload:", payload); // Debugging

      // 2. Send as JSON
      await api.post('/events/', payload);
      
      alert('✅ Event created successfully!');
      router.push('/events');
      
    } catch (error: any) {
      console.error("Creation Error:", error);
      const msg = error.response?.data?.detail || "Failed to create event";
      alert(`❌ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Event 🎟️</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Title</label>
            <input 
              name="title" 
              required 
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black" 
              placeholder="e.g. TUM Summer Party" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              name="description" 
              required 
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black" 
              placeholder="Details about the event..." 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input 
              name="location" 
              required 
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black" 
              placeholder="e.g. Garching Campus" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date & Time</label>
              <input 
                name="date" 
                type="datetime-local" 
                required 
                onChange={handleChange}
                className="w-full p-2 border rounded-md text-black" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Tickets</label>
              <input 
                name="total_tickets" 
                type="number" 
                min="1"
                required 
                onChange={handleChange}
                value={form.total_tickets}
                className="w-full p-2 border rounded-md text-black" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (€)</label>
            <input 
              name="price" 
              type="number" 
              min="0"
              required 
              onChange={handleChange}
              value={form.price}
              className="w-full p-2 border rounded-md text-black" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}