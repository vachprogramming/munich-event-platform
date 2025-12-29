import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onConfirm: (guestData?: { name: string; email: string }) => void;
  eventTitle: string;
}

export default function BookingModal({ isOpen, closeModal, onConfirm, eventTitle }: BookingModalProps) {
  const [isGuest, setIsGuest] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Check if user is logged in when modal opens
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsGuest(!token); // If no token, they are a guest
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onConfirm({ name, email });
    } else {
      onConfirm(); // No data needed for logged-in users
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Book Ticket for: <span className="text-blue-600">{eventTitle}</span>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  {isGuest ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        You are booking as a <b>Guest</b>. Please enter your details.
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          required
                          type="text"
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                          required
                          type="email"
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      You are logged in. Confirm to book instantly using your account email.
                    </p>
                  )}

                  <div className="mt-6 flex gap-3 justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}