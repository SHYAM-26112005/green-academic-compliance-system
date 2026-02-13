
async function verifyExpiration() {
    const baseUrl = 'http://localhost:5000';
    const email = 'verify_persist@example.com';
    const password = 'password123';
    const name = 'Persist User';

    try {
        // Register just in case
        await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        // Login to get token
        const res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        const token = data.token;

        if (token) {
            const payloadBase64 = token.split('.')[1];
            const payloadJson = Buffer.from(payloadBase64, 'base64').toString();
            const payload = JSON.parse(payloadJson);

            const iat = payload.iat;
            const exp = payload.exp;
            const diffDays = (exp - iat) / (60 * 60 * 24);

            console.log('JWT iat:', new Date(iat * 1000).toISOString());
            console.log('JWT exp:', new Date(exp * 1000).toISOString());
            console.log('Expiration span (days):', diffDays.toFixed(2));

            if (Math.round(diffDays) === 7) {
                console.log('SUCCESS: Token expiration is set to 7 days.');
            } else {
                console.log('FAILURE: Token expiration is not 7 days.');
            }
        } else {
            console.log('FAILURE: No token received.');
        }
    } catch (e) {
        console.error('Error during verification:', e.message);
    }
}

verifyExpiration();
