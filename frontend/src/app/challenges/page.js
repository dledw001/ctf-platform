'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const apiBase = process.env.NEXT_PUBLIC_API_URL

    async function loadChallenges() {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${apiBase}/challenges`, {
                credentials: 'include',
            });

            if (res.status === 401) {
                setError('You must be logged in to view challenges.');
                setChallenges([]);
                return;
            }

            if (!res.ok) {
                throw new Error(`Failed to load challenges (status ${res.status})`);
            }

            const data = await res.json();
            setChallenges(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load challenges.');
            setChallenges([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadChallenges();
    }, [apiBase]);

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h1 className="h4 mb-0"><strong>Challenges</strong></h1>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-light"
                                        onClick={loadChallenges}
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            {!loading && !error && challenges.length === 0 && (
                                <p className="text-muted mb-0">
                                    No challenges yet.
                                </p>
                            )}
                            {!loading && !error && challenges.length > 0 && (
                                <div className="table-responsive">
                                    <table className="table table-sm align-middle mb-0">
                                        <thead className="table-dark">
                                        <tr>
                                            <th scope="col">Name</th>
                                            <th scope="col" className="d-none d-md-table-cell">Difficulty</th>
                                            <th scope="col" className="d-none d-md-table-cell">Points</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {challenges.map((challenge) => (
                                            <tr key={challenge.id}>
                                                <td>
                                                    <div className="fw-semibold">
                                                        {challenge.title}
                                                    </div>
                                                </td>
                                                <td className="d-none d-md-table-cell">
                                                    {challenge.difficulty}
                                                </td>
                                                <td className="d-none d-md-table-cell">
                                                    {challenge.points}
                                                </td>
                                                <td>
                                                    <Link href={`/challenges/${challenge.id}`}
                                                          className="btn btn-sm btn-primary">
                                                        View
                                                    </Link>
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