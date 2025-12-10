'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '../../../lib/auth';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const {register} = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await register(email, password);
            router.push('/challenges');
        } catch (err) {
            setError(err?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h1 className="h4 mb-3 text-center">Register</h1>
                            {error && (<div className="alert alert-danger py-2" role="alert">{error}</div>)}
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-3">
                                    <input
                                        id="email"
                                        type="email"
                                        className="form-control"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        id="password"
                                        type="password"
                                        className="form-control"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mb-3"
                                    disabled={submitting}>
                                    Register
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}