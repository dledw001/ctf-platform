'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../lib/auth';

export default function AdminChallengesPage() {
    const { user, loading: authLoading } = useAuth();

    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        flag: '',
        difficulty: 'easy',
        points: 100,
    });

    const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

    // Load challenges (public GET /challenges)
    async function loadChallenges() {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${apiBase}/challenges`, {
                credentials: 'include',
            });

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
        if (!user || !user.isAdmin) {
            setLoading(false);
            return;
        }
        loadChallenges();
    }, [apiBase, user]);

    function handleFieldChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'points' ? Number(value) || 0 : value,
        }));
    }

    function startCreate() {
        setEditingId('new');
        setForm({
            title: '',
            description: '',
            flag: '',
            difficulty: 'easy',
            points: 0,
        });
    }

    function startEdit(ch) {
        setEditingId(ch.id);

        setForm({
            title: ch.title || '',
            description: ch.description || '',
            flag: '',
            difficulty: ch.difficulty || 'easy',
            points: ch.points ?? 0,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setForm({
            title: '',
            description: '',
            flag: '',
            difficulty: 'easy',
            points: 0,
        });
    }

    async function saveChallenge(e) {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const method = editingId === 'new' ? 'POST' : 'PUT';
            const url =
                editingId === 'new'
                    ? `${apiBase}/challenges`
                    : `${apiBase}/challenges/${editingId}`;

            const body = {
                title: form.title,
                description: form.description,
                flag: form.flag,
                difficulty: form.difficulty,
                points: form.points,
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg = data.error || data.message || `Save failed (status ${res.status})`;
                setError(msg);
                return;
            }

            cancelEdit();
            await loadChallenges();
        } catch (err) {
            setError(err.message || 'Save failed.');
        } finally {
            setSaving(false);
        }
    }

    async function deleteChallenge(id) {
        if (!window.confirm('Delete this challenge? This cannot be undone.')) return;

        setError('');
        try {
            const res = await fetch(`${apiBase}/challenges/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.status === 204) {
                await loadChallenges();
                return;
            }

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = data.error || data.message || `Delete failed (status ${res.status})`;
                setError(msg);
                return;
            }

            await loadChallenges();
        } catch (err) {
            setError(err.message || 'Delete failed.');
        }
    }

    // While auth state is loading
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

    // Not admin – show message (backend still enforces via requireAdmin on POST/PUT/DELETE)
    if (!user || !user.isAdmin) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h1 className="h4 mb-3"><strong>Admin Access Required</strong></h1>
                                <p className="text-muted mb-3">
                                    You must be an administrator to manage challenges.
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
                                    <strong>Admin – Challenges</strong>
                                </h1>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-light"
                                        onClick={loadChallenges}
                                    >
                                        Refresh
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={startCreate}
                                    >
                                        New challenge
                                    </button>
                                </div>
                            </div>
                            <p className="text-muted mb-4">
                                Create, edit, and delete challenges. Flags are stored securely as hashes and never shown.
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

                            {!loading && !error && challenges.length === 0 && (
                                <p className="text-muted mb-0">
                                    No challenges found. Click <strong>New challenge</strong> to create one.
                                </p>
                            )}

                            {!loading && !error && challenges.length > 0 && (
                                <div className="table-responsive mb-4">
                                    <table className="table table-sm table-hover align-middle mb-0">
                                        <thead className="table-dark">
                                        <tr>
                                            <th scope="col">Name</th>
                                            <th scope="col" className="d-none d-md-table-cell">Difficulty</th>
                                            <th scope="col" className="d-none d-md-table-cell">Points</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {challenges.map((ch) => (
                                            <tr key={ch.id}>
                                                <td>
                                                    <div className="fw-semibold">
                                                        {ch.title || 'Untitled'}
                                                    </div>
                                                    {ch.description && (
                                                        <div className="text-muted small">
                                                            {ch.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="d-none d-md-table-cell">
                                                    {ch.difficulty ?? '-'}
                                                </td>
                                                <td className="d-none d-md-table-cell">
                                                    {ch.points ?? '-'}
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-light btn-sm"
                                                            onClick={() => startEdit(ch)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => deleteChallenge(ch.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {editingId && (
                                <>
                                    <hr className="my-4" />
                                    <h2 className="h5 mb-3">
                                        {editingId === 'new' ? 'Create challenge' : 'Edit challenge'}
                                    </h2>

                                    <form onSubmit={saveChallenge} className="d-flex flex-column gap-3">
                                        <div>
                                            <input
                                                id="title"
                                                name="title"
                                                className="form-control"
                                                value={form.title}
                                                onChange={handleFieldChange}
                                                required
                                                placeholder="Title"
                                            />
                                        </div>

                                        <div>
                                            <textarea
                                                id="description"
                                                name="description"
                                                className="form-control"
                                                rows={3}
                                                value={form.description}
                                                onChange={handleFieldChange}
                                                required
                                                placeholder="Description"
                                            />
                                        </div>

                                        <div>
                                            <input
                                                id="flag"
                                                name="flag"
                                                className="form-control"
                                                value={form.flag}
                                                onChange={handleFieldChange}
                                                required
                                                placeholder="Flag"
                                            />
                                            <div className="form-text">
                                                Flags are hashed server-side and never returned in API responses.
                                            </div>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label" htmlFor="difficulty">
                                                    Difficulty
                                                </label>
                                                <select
                                                    id="difficulty"
                                                    name="difficulty"
                                                    className="form-select"
                                                    value={form.difficulty}
                                                    onChange={handleFieldChange}
                                                >
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label" htmlFor="points">
                                                    Points
                                                </label>
                                                <input
                                                    id="points"
                                                    name="points"
                                                    type="number"
                                                    className="form-control"
                                                    value={form.points}
                                                    onChange={handleFieldChange}
                                                    min={1}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={cancelEdit}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={saving}
                                            >Save
                                            </button>
                                        </div>
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
