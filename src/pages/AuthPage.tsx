import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Starfield } from '@/components/Starfield';
import { Rocket, Loader2, AlertCircle, UserPlus, LogIn } from 'lucide-react';

const MISSION_TYPES = [
  'Mars Surface',
  'Lunar Surface',
  'Lunar Orbit',
  'Mars Orbit',
  'Deep Space',
  'Asteroid Belt',
  'Space Station',
];

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [spacecraftName, setSpacecraftName] = useState('');
  const [missionType, setMissionType] = useState(MISSION_TYPES[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (!spacecraftName.trim()) {
        setError('Spacecraft name is required');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, spacecraftName, missionType);
      if (error) setError(error);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setLoading(false);
  }

  return (
    <div className="space-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Starfield />

      {/* Decorative orbit rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-cyan-500/5 spin-slow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-blue-500/5 spin-slow pointer-events-none" style={{ animationDirection: 'reverse', animationDuration: '12s' }} />

      <div className="glass-panel p-8 w-full max-w-md relative z-10 slide-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
            <Rocket size={32} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-cyan-300 tracking-wider">ORBITAL</h1>
          <p className="text-xs text-slate-500 tracking-widest uppercase mt-1">Space Circular Commerce Platform</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl mb-6">
          <button
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              mode === 'signin' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              mode === 'signup' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Spacecraft / Mission Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Mars Habitat Alpha"
                  value={spacecraftName}
                  onChange={(e) => setSpacecraftName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Mission Type</label>
                <select className="input-field" value={missionType} onChange={(e) => setMissionType(e.target.value)}>
                  {MISSION_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Email / Comm ID</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="commander@orbital.space"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Access Code</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : mode === 'signin' ? (
              <LogIn size={18} />
            ) : (
              <UserPlus size={18} />
            )}
            {loading ? 'Connecting...' : mode === 'signin' ? 'Connect to Network' : 'Register Spacecraft'}
          </button>
        </form>

        <p className="text-xs text-slate-600 text-center mt-5">
          {mode === 'signin'
            ? "New spacecraft? Switch to Register to join the network."
            : 'Already registered? Switch to Sign In to connect.'}
        </p>
      </div>
    </div>
  );
}
