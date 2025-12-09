'use client'

import Link from 'next/link';
import { useAuth } from '../lib/auth';

export default function NavBar() {
    const { user, logout } = useAuth();

    return (
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/">CTF</Link>
                    {user?.isAdmin && <Link href="/admin">Admin</Link>}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {user ? (
                        <>
                            <span>{user.email}</span>
                            <button onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">Login</Link>
                            <Link href="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}