export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string; // ISO string from backend
  total_tickets: number;
  available_tickets: number;
  price: number;
}

export interface Booking {
  id: number;
  event_id: number;
  status: string;
}