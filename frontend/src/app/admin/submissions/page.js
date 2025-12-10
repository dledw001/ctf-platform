'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../lib/auth';

export default function AdminSubmissionsPage() {
    const {user, loading: authLoading} = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const apiBase = process.env.NEXT_PUBLIC_API_URL

    async function loadSubmissions() {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${apiBase}/submissions`, {
                credentials: 'include',
            });

            if (res.status === 401 || res.status === 403) {
                setError('Admin access required.');
                setSubmissions([]);
                return;
            }

            if (!res.ok) {
                throw new Error(`Failed to load submissions (status ${res.status})`);
            }

            const data = await res.json();
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load submissions.');
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!user || !user.isAdmin) {
            setLoading(false);
            return;
        }
        loadSubmissions();
    }, [apiBase, user]);

    if (authLoading) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-body d-flex justify-content-center py-4">
                                <div className="spinner-border text-secondary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user || !user.isAdmin) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h1 className="h4 mb-3"><strong>Admin Access Required</strong></h1>
                                <p className="text-muted mb-3">
                                    You must be an administrator to view submissions.
                                </p>
                                <Link href="/" className="btn btn-primary">
                                    Go to homepage
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h1 className="h4 mb-0">
                                    <strong>Admin Dashboard: Submissions</strong>
                                </h1>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light"
                                    onClick={loadSubmissions}
                                    disabled={loading}
                                >
                                    Refresh
                                </button>
                            </div>
                            <p className="text-muted mb-4">
                                List all submissions.
                            </p>

                            {loading && (
                                <div className="d-flex justify-content-center py-4">
                                    <div className="spinner-border text-secondary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}

                            {!loading && error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {!loading && !error && submissions.length === 0 && (
                                <p className="text-muted mb-0">
                                    No submissions yet.
                                </p>
                            )}

                            {!loading && !error && submissions.length > 0 && (
                                <div className="table-responsive">
                                    <table className="table table-sm align-middle mb-0">
                                        <thead className="table-dark">
                                        <tr>
                                            <th scope="col">Submission Timestamp</th>
                                            <th scope="col">User</th>
                                            <th scope="col">Challenge</th>
                                            <th scope="col" className="d-none d-md-table-cell">
                                                Difficulty
                                            </th>
                                            <th scope="col" className="d-none d-md-table-cell">
                                                Points
                                            </th>
                                            <th scope="col">Correct</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {submissions.map((s) => (
                                            <tr key={s.id}>
                                                <td>
                                                    {new Date(s.createdAt).toLocaleString()}
                                                </td>
                                                <td>{s.userEmail}</td>
                                                <td>
                                                    <div className="fw-semibold">
                                                        {s.challengeTitle}
                                                    </div>
                                                </td>
                                                <td className="d-none d-md-table-cell">
                                                    {s.challengeDifficulty}
                                                </td>
                                                <td className="d-none d-md-table-cell">
                                                    {s.challengePoints}
                                                </td>
                                                <td>
                                                    {s.isCorrect ? (
                                                        <span className="badge bg-success">Correct</span>
                                                    ) : (
                                                        <span className="badge bg-danger">Incorrect</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
