const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
    const url =  `${API_BASE_URL}${path}`;

    const res = await fetch(url, {
       credentials: 'include',
       headers: {
           'Content-Type': 'application/json',
           ...(options.headers || {}),
       } ,
        ...options,
    });

    let data = null;
    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!res.ok) {
        const message =  data?.error || data?.message || `HTTP ${res.status}`;
        const err = new Error(message);
        err.status = res.status;
        throw err;
    }

    return data;
}

export function get(path) {
    return request(path, { method: 'GET' });
}

export function post(path, body) {
    return request(path, { method: 'POST', body: JSON.stringify(body) });
}

export function put(path, body) {
    return request(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function del(path) {
    return request(path, { method: 'DELETE' });
}