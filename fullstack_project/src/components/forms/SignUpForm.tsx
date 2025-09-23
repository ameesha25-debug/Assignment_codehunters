import React, { useState } from 'react';

type Props = {
  onSwitch: () => void;
  onSubmit: (form: { mobile: string; password: string }) => Promise<void> | void;
};

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{7}$/;

export default function SignUpForm({ onSwitch, onSubmit }: Props) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleMobileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.replace(/\D/g, '');
    setMobile(input.slice(0, 10));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits');
      return;
    }
    if (!passwordRegex.test(password)) {
      setError('Password must be exactly 7 characters, include one uppercase letter and one special symbol.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ mobile, password });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign up form">
      <div className="space-y-1.5">
        <label htmlFor="mobile" className="text-sm font-medium text-zinc-700">Mobile number</label>
        <input
          id="mobile"
          inputMode="numeric"
          autoComplete="tel"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
          placeholder="Enter 10-digit mobile number"
          value={mobile}
          onChange={handleMobileChange}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">Password</label>
        <input
          id="password"
          type="password"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
          placeholder="7-character password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={7}
          required
        />
        <p className="text-xs text-zinc-500">Must be 7 characters, include 1 uppercase and 1 special symbol.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-amber-500 py-2.5 text-white font-semibold hover:bg-amber-600 disabled:opacity-60"
      >
        {submitting ? 'Signing up…' : 'Sign Up'}
      </button>

      <p className="text-sm text-zinc-700">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-blue-600 underline">
          Sign in
        </button>
      </p>
    </form>
  );
}
