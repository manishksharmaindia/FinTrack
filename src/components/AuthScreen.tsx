import { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { deriveKey } from '../crypto';
import { useAuth } from '../AuthContext';
import logoUrl from '../assets/logo.png';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const { setEncryptionKey } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // Derive encryption key using password and user ID as salt
      const key = await deriveKey(password, userCredential.user.uid);
      setEncryptionKey(key);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError(err.message || 'Authentication failed');
      }
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #0f172a 60%, #1a1a2e 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute rounded-full blur-[80px] opacity-40 w-[300px] h-[300px] bg-blue-500/30 -top-20 -right-16 animate-[lockFloat1_8s_ease-in-out_infinite]" />
      <div className="absolute rounded-full blur-[80px] opacity-40 w-[250px] h-[250px] bg-violet-500/25 -bottom-16 -left-10 animate-[lockFloat2_10s_ease-in-out_infinite]" />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', margin: '0 20px' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '48px 36px 40px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative' }}>
            {!isLogin && (
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); setResetSent(false); }}
                className="absolute left-0 top-0 p-2 text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full"
                title="Back to Sign In"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div
              style={{
                width: '72px', height: '72px', margin: '0 auto 16px', borderRadius: '20px', overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
              }}
            >
              <img src={logoUrl} alt="FinTrack" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-br from-blue-400 to-violet-400 bg-clip-text text-transparent mb-2 tracking-tight">
              {isLogin ? 'FinTrack' : 'Create Account'}
            </h1>
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-sm font-medium">
              <ShieldCheck size={14} />
              <span>End-to-End Encrypted</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setResetSent(false); }}
                  placeholder="you@example.com"
                  className="w-full py-4 pr-12 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-base outline-none transition-all focus:border-blue-400/50"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full py-4 pr-[4.5rem] bg-white/5 border border-white/10 rounded-xl text-slate-100 text-base outline-none transition-all focus:border-blue-400/50"
                  style={{ paddingLeft: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 p-1 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-rose-400 text-sm mb-4 flex items-center gap-1.5">
                <span className="text-base">⚠</span> {error}
              </p>
            )}
            
            {resetSent && (
              <p className="text-emerald-400 text-sm mb-4 flex items-center gap-1.5">
                <span className="text-base">✓</span> Password reset email sent! Check spam folder too
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all ${
                loading 
                  ? 'bg-white/5 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-blue-500 to-violet-600 text-white hover:shadow-[0_8px_24px_rgba(59,130,246,0.3)]'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400 flex flex-col gap-3">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setResetSent(false); }}
              className="hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
            
            {isLogin && (
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="hover:text-white transition-colors"
              >
                Forgot your password?
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes lockFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.1); }
        }
        @keyframes lockFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.15); }
        }
      `}</style>
    </div>
  );
}
