import React, { useState } from 'react';


type Props = {
  onSubmit: (form: { mobile: string; password: string }) => Promise<void> | void;
  onSwitch: () => void;
};

export default function SignInForm({ onSubmit, onSwitch }: Props) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ mobile: mobile.trim(), password });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign in form">
      <div className="space-y-1.5">
        <label htmlFor="mobile" className="text-sm font-medium text-zinc-700">
          Mobile number
        </label>
        <input
          id="mobile"
          inputMode="numeric"
          autoComplete="tel"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            className="w-full rounded-md border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-zinc-300"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            aria-label={showPwd ? 'Hide password' : 'Show password'}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-600 hover:text-zinc-900"
          >
            {showPwd ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-amber-500 py-2.5 text-white font-semibold hover:bg-amber-600 disabled:opacity-60"
      >
        {submitting ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-sm text-zinc-700">
        Don’t have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-blue-600 underline">
          Sign up
        </button>
      </p>
    </form>
  );
}
