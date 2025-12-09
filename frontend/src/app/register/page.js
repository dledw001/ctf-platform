'use client'

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import { useAuth } from '../../../lib/auth';

export default function LoginPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
            await register(email, password);
            router.push('/register');
        } catch (err) {
            setError(err.data?.error || 'Register failed');
        }
    }

    return (
        <section>
            <h1 className="text-xl font-bold mb-4">Register</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
                <input
                    type="email"
                    placeholder="Email"
                    className="border px-2 py-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border px-2 py-1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className="border px-3 py-1">
                    Register
                </button>
            </form>
        </section>
    );
}