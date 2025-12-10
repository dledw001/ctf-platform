'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth';


export default function ScoreboardPage() {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const apiBase = process.env.NEXT_PUBLIC_API_URL

    async function loadScoreboard() {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${apiBase}/scoreboard`, {
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error(`Failed to load scoreboard (status ${res.status})`);
            }

            const data = await res.json();
            setRows(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load scoreboard.');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadScoreboard();
    }, [apiBase]);

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h1 className="h4 mb-0"><strong>Scoreboard</strong></h1>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-light"
                                        onClick={loadScoreboard}
                                        disabled={loading}
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            {!loading && !error && rows.length === 0 && (
                                <p className="text-muted mb-0">
                                    No scores yet.
                                </p>
                            )}
                            {!loading && !error && rows.length > 0 && (
                                <div className="table-responsive">
                                    <table className="table table-sm align-middle mb-0">
                                        <thead className="table-dark">
                                        <tr>
                                            <th scope="col">Rank</th>
                                            <th scope="col">User</th>
                                            <th scope="col">Score</th>
                                            <th scope="col" className="d-none d-md-table-cell">
                                                Joined
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {rows.map((row, index) => {
                                            return (
                                                <tr
                                                    key={row.id}
                                                >
                                                    <td>{index + 1}</td>
                                                    <td>{row.email}</td>
                                                    <td>{row.score}</td>
                                                    <td className="d-none d-md-table-cell">
                                                        {row.createdAt
                                                            ? new Date(row.createdAt).toLocaleDateString()
                                                            : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
