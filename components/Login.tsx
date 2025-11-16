import React, { useState, FormEvent } from 'react';

const APP_PASSWORD = "meteoRT";

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (password === APP_PASSWORD) {
        sessionStorage.setItem("meteoRT_auth", "true");
        onLoginSuccess();
      } else {
        setError("Password non corretta");
        setPassword('');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-800 to-black flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          Meteo RT - Login
        </h1>
        <p className="text-md text-white/70 mb-8">
          Inserisci la password per accedere.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              aria-label="Password"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-semibold">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full px-8 py-4 bg-indigo-600 text-white font-bold rounded-full shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:bg-indigo-400/50 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifica...
                </div>
              ) : 'Accedi'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
