'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ChallengeDetailPage() {
    const { id } = useParams();

    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [flag, setFlag] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitVariant, setSubmitVariant] = useState('');

    const apiBase = process.env.NEXT_PUBLIC_API_URL

    useEffect(() => {
        if (!id) return;

        async function loadChallenge() {
            setLoading(true);
            setLoadError('');
            setChallenge(null);

            try {
                const res = await fetch(`${apiBase}/challenges/${id}`, {
                    credentials: 'include',
                });

                if (res.status === 401) {
                    setLoadError('You must be logged in to view this challenge.');
                    return;
                }

                if (res.status === 404) {
                    setLoadError('Challenge not found.');
                    return;
                }

                if (!res.ok) {
                    throw new Error(`Failed to load challenge (status ${res.status})`);
                }

                const data = await res.json();
                setChallenge(data);
            } catch (err) {
                setLoadError(err.message || 'Failed to load challenge.');
            } finally {
                setLoading(false);
            }
        }

        loadChallenge();
    }, [apiBase, id]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitMessage('');
        setSubmitVariant('');

        if (!flag.trim()) {
            setSubmitMessage('Please enter a flag before submitting.');
            setSubmitVariant('danger');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`${apiBase}/submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    challengeId: id,
                    flag: flag.trim(),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 401) {
                setSubmitMessage('You must be logged in to submit flags.');
                setSubmitVariant('danger');
                return;
            }

            if (!res.ok) {
                const msg = data.error || data.message || `Submission failed (status ${res.status})`;
                setSubmitMessage(msg);
                setSubmitVariant('danger');
                return;
            }

            if (data.correct === true) {
                setSubmitMessage(data.message || 'Correct flag!');
                setSubmitVariant('success');
            } else if (data.correct === false) {
                setSubmitMessage(data.message || 'Incorrect flag, try again.');
                setSubmitVariant('danger');
            } else {
                setSubmitMessage(data.message || 'Submission received.');
                setSubmitVariant('success');
            }
        } catch (err) {
            setSubmitMessage(err.message || 'Submission failed.');
            setSubmitVariant('danger');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            {!loading && !loadError && challenge && (
                                <>
                                    <h1 className="h4 mb-3">
                                        {challenge.title}
                                    </h1>

                                    <div className="text-muted mb-2">
                                        {challenge.difficulty && (
                                            <span className="me-3">
                                                <strong>Difficulty:</strong>{challenge.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-muted mb-2">
                                        {challenge.points && (
                                            <span className="me-3"><strong>Points:</strong> {challenge.points}</span>
                                        )}
                                    </div>
                                    {challenge.description && (<p className="mb-4">{challenge.description}</p>)}
                                    <hr className="my-4" />
                                    {submitMessage && (
                                        <div
                                            className={`alert alert-${submitVariant || 'info'} py-2`} role="alert">
                                            {submitMessage}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                                        <div>
                                            <input
                                                id="flag"
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter flag"
                                                value={flag}
                                                onChange={(e) => setFlag(e.target.value)}
                                            />
                                        </div>

                                        <button type="submit"
                                            className="btn btn-primary w-100 mb-3"
                                            disabled={submitting}>
                                            Submit
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
