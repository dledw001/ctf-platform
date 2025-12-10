'use client';

import { useEffect } from 'react';

export default function BootstrapClient() {
    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min.js')
            .catch(err => {
                console.error('Failed to load Bootstrap JS', err);
            });
    }, []);

    return null;
}