'use client';

import { useState } from 'react';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = email !== '' && password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement actual fetch logic
    setTimeout(() => {
      setLoading(false);
      setMessage('User created'); // Placeholder
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button type="submit" disabled={!isValid || loading}>
        {loading ? 'Signing up...' : 'Sign up'}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
