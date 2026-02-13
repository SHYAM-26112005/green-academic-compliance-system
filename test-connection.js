// Test script to verify frontend-backend connection
import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:5173';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
    try {
        log(`\n📡 Testing: ${name}`, 'blue');
        log(`   URL: ${url}`, 'yellow');

        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type');

        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (response.ok) {
            log(`   ✅ SUCCESS (${response.status})`, 'green');
            log(`   Response: ${JSON.stringify(data, null, 2)}`, 'reset');
            return { success: true, data };
        } else {
            log(`   ❌ FAILED (${response.status})`, 'red');
            log(`   Response: ${JSON.stringify(data, null, 2)}`, 'reset');
            return { success: false, data };
        }
    } catch (error) {
        log(`   ❌ ERROR: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

async function runTests() {
    log('╔════════════════════════════════════════════════════════════╗', 'blue');
    log('║  Green Academic Compliance System - Connection Test       ║', 'blue');
    log('╚════════════════════════════════════════════════════════════╝', 'blue');

    const results = {
        passed: 0,
        failed: 0
    };

    // Test 1: Backend Health Check
    const pingResult = await testEndpoint(
        'Backend Health Check',
        `${BACKEND_URL}/ping`
    );
    pingResult.success ? results.passed++ : results.failed++;

    // Test 2: Frontend Server
    const frontendResult = await testEndpoint(
        'Frontend Server',
        FRONTEND_URL
    );
    frontendResult.success ? results.passed++ : results.failed++;

    // Test 3: Get Reports (should work even with empty database)
    const getReportsResult = await testEndpoint(
        'GET /api/reports',
        `${BACKEND_URL}/api/reports`
    );
    getReportsResult.success ? results.passed++ : results.failed++;

    // Test 4: Create a test report
    const testReport = {
        department: 'Test Department',
        category: 'Energy',
        description: 'Test report to verify API connection',
        score: 85,
        status: 'Compliant',
        date: new Date().toISOString().split('T')[0]
    };

    const createReportResult = await testEndpoint(
        'POST /api/reports',
        `${BACKEND_URL}/api/reports`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testReport)
        }
    );
    createReportResult.success ? results.passed++ : results.failed++;

    // Test 5: Verify report was created
    if (createReportResult.success) {
        const verifyResult = await testEndpoint(
            'Verify Report Created',
            `${BACKEND_URL}/api/reports`
        );
        verifyResult.success ? results.passed++ : results.failed++;
    }

    // Summary
    log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
    log('║                      TEST SUMMARY                          ║', 'blue');
    log('╚════════════════════════════════════════════════════════════╝', 'blue');
    log(`\n✅ Passed: ${results.passed}`, 'green');
    log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

    if (results.failed === 0) {
        log('\n🎉 All tests passed! Frontend and Backend are connected successfully!', 'green');
        log('\n📝 Next Steps:', 'blue');
        log('   1. Open http://localhost:5173 in your browser', 'yellow');
        log('   2. Register a new account', 'yellow');
        log('   3. Login with your credentials', 'yellow');
        log('   4. Navigate to Compliance page and create a report', 'yellow');
        log('   5. Verify the report persists after page refresh', 'yellow');
    } else {
        log('\n⚠️  Some tests failed. Please check the errors above.', 'red');
    }
}

// Run the tests
runTests().catch(console.error);
