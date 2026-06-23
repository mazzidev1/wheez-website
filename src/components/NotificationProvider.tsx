import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { User } from 'firebase/auth';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface NotificationProviderProps {
  user: User | null;
}

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success';
}

export default function NotificationProvider({ user }: NotificationProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const initialLoadRef = useRef(true);
  const knownTripsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      setToasts([]);
      return;
    }

    const q = query(
      collection(db, 'trips'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (initialLoadRef.current) {
        snapshot.docs.forEach(doc => {
          knownTripsRef.current[doc.id] = doc.data().status;
        });
        initialLoadRef.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const tripId = change.doc.id;
          const newStatus = change.doc.data().status;
          const oldStatus = knownTripsRef.current[tripId];

          if (oldStatus !== newStatus) {
            knownTripsRef.current[tripId] = newStatus;

            let title = 'Trip Update';
            let message = `Your trip status changed to ${newStatus}.`;
            let type: 'info' | 'success' = 'info';

            if (newStatus === 'accepted') {
              title = 'Driver Assigned';
              message = 'A driver has been assigned and is on the way.';
              type = 'success';
            } else if (newStatus === 'arriving') {
              title = 'Driver Arriving';
              message = 'Your driver is arriving at the pickup location.';
              type = 'info';
            } else if (newStatus === 'active') {
              title = 'Trip Started';
              message = 'Your trip is now in progress.';
            } else if (newStatus === 'completed') {
              title = 'Trip Completed';
              message = 'You have reached your destination.';
              type = 'success';
            }

            const id = Math.random().toString(36).substr(2, 9);
            setToasts(prev => [...prev, { id, title, message, type }]);

            setTimeout(() => {
              setToasts(prev => prev.filter(t => t.id !== id));
            }, 6000);
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'trips');
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-auto flex items-start gap-4 p-4 rounded-2xl shadow-lg bg-brand-surface border border-brand-accent/20"
          >
            <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-[#d4ff63]/20 text-[#222]' : 'bg-[#d4ff63]/20 text-[#222]'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={14} /> : <Info size={14} />}
            </div>
            <div className="flex-1 field">
              <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
              <p className="text-sm text-brand-muted leading-tight mt-0.5">{toast.message}</p>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-brand-muted hover:text-brand-text">
               <ChevronRight size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
