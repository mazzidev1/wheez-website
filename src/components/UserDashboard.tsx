import { ArrowLeft, LogOut, User as UserIcon, Calendar, Clock, MapPin, Search } from 'lucide-react';
import Logo from './Logo';
import { User } from 'firebase/auth';

interface Props {
  user: User;
  onLogout: () => void;
  onBack: () => void;
}

export default function UserDashboard({ user, onLogout, onBack }: Props) {
  return (
    <div className="min-h-screen bg-brand-base flex flex-col font-sans">
      <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center border-b border-black/5 gap-4 sm:gap-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <Logo size={20} className="text-brand-text hover:rotate-12 transition-transform duration-300" />
            <span className="font-sans text-lg tracking-[0.15em] uppercase font-medium">Wheez</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 sm:gap-3 bg-black/5 px-3 sm:px-4 py-2 rounded-full flex-1 sm:flex-auto overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full flex-shrink-0" />
            ) : (
              <UserIcon className="w-4 h-4 text-brand-muted flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-brand-text truncate">{user.displayName || user.email}</span>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 bg-black/5 hover:bg-black/10 sm:bg-transparent sm:hover:bg-black/5 px-4 py-2 rounded-full transition-colors text-sm font-medium text-brand-muted hover:text-brand-text flex-shrink-0"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/3 flex flex-col gap-8">
          <div className="bg-brand-surface border border-black/5 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
            <h2 className="text-2xl font-display text-brand-text">Overview</h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-4 border-b border-black/5">
                <span className="text-brand-muted text-sm uppercase tracking-widest font-mono">Total Trips</span>
                <span className="text-xl font-medium">0</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-black/5">
                <span className="text-brand-muted text-sm uppercase tracking-widest font-mono">Upcoming</span>
                <span className="text-xl font-medium">0</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-black/5">
                <span className="text-brand-muted text-sm uppercase tracking-widest font-mono">Saved Drivers</span>
                <span className="text-xl font-medium">0</span>
              </div>
            </div>
            <button 
              onClick={onBack}
              className="mt-4 px-6 py-4 bg-[#191814] text-[#FAF9F6] rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <Search size={18} /> Find a driver
            </button>
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <h2 className="text-2xl font-display text-brand-text mb-2">Recent Activity</h2>
          
          <div className="bg-brand-surface border border-black/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
            <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 text-brand-muted" />
            </div>
            <h3 className="text-xl font-display text-brand-text mb-2">No trips yet</h3>
            <p className="text-brand-muted max-w-sm mb-8">When you book your first ride, your history and receipts will appear here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
