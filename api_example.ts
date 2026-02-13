/**
 * Example of how to make an authenticated request to the backend
 * from any component in your frontend.
 */

async function fetchWithAuth(url: string, options: any = {}) {
    // 1. Get the token from localStorage
    const token = localStorage.getItem('token');

    // 2. Prepare headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // 3. Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 4. Make the request
    const response = await fetch(url, {
        ...options,
        headers,
    });

    // 5. Check if token is expired (401 Unauthorized)
    if (response.status === 401) {
        console.error('Session expired. Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    return response.json();
}

// Usage Example:
// const data = await fetchWithAuth('http://localhost:5000/api/some-protected-route');
