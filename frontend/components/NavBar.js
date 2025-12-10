'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { useEffect } from 'react';

export default function NavBar() {
    const { user, logout } = useAuth();

    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min.js')
            .catch((err) => console.error("Failed to load Bootstrap JS", err));
    }, []);

    return (
        <nav className="navbar border-bottom">
            <div className="container d-flex align-items-center">
                <div className="d-flex justify-content-start">
                    <Link className="navbar-brand mb-0 h1" href="/">
                        <strong>CTF</strong>
                    </Link>
                    <ul className="navbar-nav flex-row gap-3 mb-0">
                        <li className="nav-item">
                            <Link className="nav-link" href="/challenges">Challenges</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" href="/scoreboard">Scoreboard</Link>
                        </li>
                        {user?.isAdmin && (
                            <li className="nav-item dropdown position-relative">
                                <a className="nav-link dropdown-toggle" href="#" role="button"
                                      data-bs-toggle="dropdown" aria-expanded="false">Admin</a>
                                <ul className="dropdown-menu position-absolute">
                                    <li><a className="dropdown-item" href="/admin/challenges">Challenges</a></li>
                                    <li><a className="dropdown-item" href="/admin/submissions">Submissions</a></li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>
                <div className="d-flex align-items-center">
                    {!user && (
                        <>
                            <Link href="/login" className="btn btn-primary btn-sm me-2">Login</Link>
                            <Link href="/register" className="btn btn-outline-light btn-sm">Register</Link>
                        </>
                    )}
                    {user && (
                        <>
                            <span className="navbar-text me-3">
                                <a >{user.email}</a>
                            </span>
                            <button
                                onClick={logout}
                                className="btn btn-outline-light btn-sm">
                                Logout
                            </button>
                        </>
                    )}
                </div>

            </div>
        </nav>
    );
}
