/**
 * Comprehensive Active-Active Cloudflare Workers Test Suite
 * Validates:
 * 1. 50/50 traffic distribution across 200 requests
 * 2. Static asset delivery across both workers
 * 3. SPA route fallback handling
 * 4. Idempotent request automatic failover on 5xx / exception
 * 5. Non-idempotent request mutation safety (prevents duplicate transactions)
 * 6. Loop prevention & hop limit
 * 7. Upstream health check probe & metrics reporting
 */

const fs = require('fs');
const path = require('path');

// Mock static assets from dist
const distDir = path.join(__dirname, '..', 'dist');

function getMockAsset(pathname) {
  let localPath = pathname === '/' ? '/index.html' : pathname;
  // Strip leading slash
  if (localPath.startsWith('/')) localPath = localPath.slice(1);
  const fullPath = path.join(distDir, localPath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypeMap = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.txt': 'text/plain; charset=utf-8',
      '.xml': 'application/xml; charset=utf-8',
    };
    return {
      status: 200,
      headers: new Headers({
        'content-type': contentTypeMap[ext] || 'application/octet-stream',
        'content-length': String(fs.statSync(fullPath).size),
      }),
      body: fs.readFileSync(fullPath),
    };
  }
  return null;
}

// Mock App Worker Factory
function createAppWorker(instanceName, failureConfig = { failMode: null }) {
  return {
    async fetch(request) {
      const url = new URL(request.url);

      // Controlled Failure injection for testing
      if (failureConfig.failMode === 'throw') {
        throw new Error(`Simulated worker crash in ${instanceName}`);
      }
      if (failureConfig.failMode === '500') {
        return new Response(JSON.stringify({ error: `Internal error in ${instanceName}` }), {
          status: 500,
          headers: {
            'content-type': 'application/json',
            'x-officewala-app-instance': instanceName,
          },
        });
      }

      // Health endpoint
      if (url.pathname === '/healthz' || url.pathname === '/internal/health') {
        return new Response(
          JSON.stringify({
            status: 'healthy',
            worker: `officewala-${instanceName}`,
            instance: instanceName,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              'content-type': 'application/json; charset=utf-8',
              'x-officewala-app-instance': instanceName,
            },
          }
        );
      }

      // Static Asset fetch
      const asset = getMockAsset(url.pathname);
      if (asset) {
        const headers = new Headers(asset.headers);
        headers.set('x-officewala-app-instance', instanceName);
        headers.set('x-officewala-version', '1.0.0');
        return new Response(asset.body, { status: 200, headers });
      }

      // SPA Fallback for navigation requests
      const isStaticExt = /\.[a-zA-Z0-9]+$/.test(url.pathname);
      if (!isStaticExt && request.method === 'GET') {
        const indexAsset = getMockAsset('/index.html');
        if (indexAsset) {
          const headers = new Headers(indexAsset.headers);
          headers.set('x-officewala-app-instance', instanceName);
          headers.set('x-officewala-version', '1.0.0');
          return new Response(indexAsset.body, { status: 200, headers });
        }
      }

      return new Response('Not Found', {
        status: 404,
        headers: { 'x-officewala-app-instance': instanceName },
      });
    },
  };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('   OFFICEWALA ACTIVE-ACTIVE ARCHITECTURE AUTOMATED TEST SUITE   ');
  console.log('================================================================\n');

  // Load router module logic
  let appAFailure = { failMode: null };
  let appBFailure = { failMode: null };

  const appA = createAppWorker('app-a', appAFailure);
  const appB = createAppWorker('app-b', appBFailure);

  // Import router worker directly
  // Note: We use dynamic import of the compiled/transpiled router or direct JS implementation
  const { default: routerWorker } = await import('../workers/router/worker.ts');

  const env = {
    APP_A: appA,
    APP_B: appB,
    ROUTER_VERSION: '1.0.0',
    ENVIRONMENT: 'test',
  };

  const ctx = {
    waitUntil: () => {},
    passThroughOnException: () => {},
  };

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Test assertion failed: ${message}`);
    }
  }

  // --- TEST 1: 50/50 Traffic Distribution ---
  console.log('--- TEST 1: Probabilistic 50/50 Request Distribution (200 requests) ---');
  const sampleCount = 200;
  const counts = { 'officewala-app-a': 0, 'officewala-app-b': 0 };

  for (let i = 0; i < sampleCount; i++) {
    const req = new Request(`https://officewala.workers.dev/?sample=${i}`, { method: 'GET' });
    const res = await routerWorker.fetch(req, env, ctx);
    const upstream = res.headers.get('x-officewala-upstream');
    if (counts[upstream] !== undefined) {
      counts[upstream]++;
    }
  }

  const ratioA = (counts['officewala-app-a'] / sampleCount) * 100;
  const ratioB = (counts['officewala-app-b'] / sampleCount) * 100;
  console.log(`  Distribution: App A = ${counts['officewala-app-a']} (${ratioA.toFixed(1)}%), App B = ${counts['officewala-app-b']} (${ratioB.toFixed(1)}%)`);
  assert(ratioA >= 38 && ratioA <= 62, `Distribution between 38% and 62% (Actual: ${ratioA.toFixed(1)}% vs ${ratioB.toFixed(1)}%)`);
  assert(counts['officewala-app-a'] > 0 && counts['officewala-app-b'] > 0, 'Both workers actively processed requests');

  // --- TEST 2: Static Asset Delivery ---
  console.log('\n--- TEST 2: Static Asset Delivery & Integrity ---');
  const assetsToTest = [
    { path: '/', expectedType: 'text/html' },
    { path: '/robots.txt', expectedType: 'text/plain' },
    { path: '/sitemap.xml', expectedType: 'application/xml' },
    { path: '/llms.txt', expectedType: 'text/plain' },
  ];

  for (const asset of assetsToTest) {
    const req = new Request(`https://officewala.workers.dev${asset.path}`, { method: 'GET' });
    const res = await routerWorker.fetch(req, env, ctx);
    assert(res.status === 200, `Path ${asset.path} returned 200 OK`);
    assert(
      res.headers.get('content-type')?.includes(asset.expectedType),
      `Path ${asset.path} Content-Type has ${asset.expectedType} (Actual: ${res.headers.get('content-type')})`
    );
    assert(res.headers.get('x-officewala-routed-by') === 'officewala-router', `Routed by router header present`);
  }

  // --- TEST 3: SPA Client-side Route Fallback ---
  console.log('\n--- TEST 3: SPA Route Fallback (/manager, /wfh, /auth) ---');
  const routes = ['/manager', '/wfh', '/auth', '/chai', '/deadline'];
  for (const r of routes) {
    const req = new Request(`https://officewala.workers.dev${r}`, { method: 'GET' });
    const res = await routerWorker.fetch(req, env, ctx);
    assert(res.status === 200, `SPA route ${r} returns 200 OK`);
    assert(res.headers.get('content-type')?.includes('text/html'), `SPA route ${r} serves index.html`);
  }

  // --- TEST 4: Controlled Failover (Idempotent GET on 500 error) ---
  console.log('\n--- TEST 4: Automatic Failover on 500 Error (GET) ---');
  // Inject 500 failure into App A
  appAFailure.failMode = '500';
  let failoverCount = 0;

  for (let i = 0; i < 20; i++) {
    const req = new Request(`https://officewala.workers.dev/chai?test=${i}`, { method: 'GET' });
    const res = await routerWorker.fetch(req, env, ctx);
    assert(res.status === 200, `Request ${i} successfully healed to 200 OK despite App A returning 500`);
    if (res.headers.get('x-officewala-failover') === 'true') {
      failoverCount++;
      assert(res.headers.get('x-officewala-upstream') === 'officewala-app-b', 'Healed request served by App B');
    }
  }
  console.log(`  Successfully triggered ${failoverCount} automatic failovers from App A -> App B`);
  assert(failoverCount > 0, 'Failover mechanism caught 500 errors and transparently retried');
  appAFailure.failMode = null; // Reset

  // --- TEST 5: Controlled Failover on Worker Exception (Throw) ---
  console.log('\n--- TEST 5: Automatic Failover on Worker Runtime Crash (Throw) ---');
  appBFailure.failMode = 'throw';
  let crashFailovers = 0;

  for (let i = 0; i < 20; i++) {
    const req = new Request(`https://officewala.workers.dev/manager?crash_test=${i}`, { method: 'GET' });
    const res = await routerWorker.fetch(req, env, ctx);
    assert(res.status === 200, `Request ${i} returned 200 OK despite App B crashing`);
    if (res.headers.get('x-officewala-failover') === 'true') {
      crashFailovers++;
      assert(res.headers.get('x-officewala-upstream') === 'officewala-app-a', 'Crashed request rerouted to App A');
    }
  }
  console.log(`  Successfully caught and healed ${crashFailovers} worker exceptions`);
  assert(crashFailovers > 0, 'Exception failover succeeded');
  appBFailure.failMode = null; // Reset

  // --- TEST 6: Non-Idempotent Mutation Safety (POST) ---
  console.log('\n--- TEST 6: Mutation Safety on Non-Idempotent (POST) ---');
  appAFailure.failMode = '500';
  // Send POST to App A; router must NOT blindly retry POST to avoid duplicate mutations
  let postAttempts = 0;
  let skippedRetryCount = 0;

  for (let i = 0; i < 30; i++) {
    const req = new Request('https://officewala.workers.dev/api/clips', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Clip' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await routerWorker.fetch(req, env, ctx);
    const upstream = res.headers.get('x-officewala-upstream');
    if (upstream === 'officewala-app-a') {
      postAttempts++;
      // Since App A failed, it should NOT failover to App B
      assert(res.status === 500 || res.status === 502, 'Non-idempotent POST returned 500/502 without retrying on App B');
      assert(res.headers.get('x-officewala-failover') === 'false', 'x-officewala-failover is false on POST');
      skippedRetryCount++;
    }
  }
  console.log(`  Verified ${skippedRetryCount} POST requests avoided duplicate retry execution`);
  assert(skippedRetryCount > 0, 'Non-idempotent mutation protection confirmed');
  appAFailure.failMode = null; // Reset

  // --- TEST 7: Routing Loop Prevention ---
  console.log('\n--- TEST 7: Routing Loop Prevention (Hop Count Guard) ---');
  const loopingReq = new Request('https://officewala.workers.dev/', {
    headers: { 'x-officewala-router-hop': '3' },
  });
  const loopRes = await routerWorker.fetch(loopingReq, env, ctx);
  assert(loopRes.status === 508, 'Request with hop > 2 rejected with 508 Loop Detected');

  // --- TEST 8: Health Probes & Metrics Dashboard ---
  console.log('\n--- TEST 8: Router Health Probe & Live Metrics API ---');
  const healthReq = new Request('https://officewala.workers.dev/healthz');
  const healthRes = await routerWorker.fetch(healthReq, env, ctx);
  assert(healthRes.status === 200, '/healthz returned 200 OK');
  const healthData = await healthRes.json();
  assert(healthData.status === 'healthy', 'Router health probe reports status: healthy');
  assert(healthData.upstreams['officewala-app-a'].status === 'healthy', 'Upstream App A verified healthy');
  assert(healthData.upstreams['officewala-app-b'].status === 'healthy', 'Upstream App B verified healthy');

  const metricsReq = new Request('https://officewala.workers.dev/router-metrics');
  const metricsRes = await routerWorker.fetch(metricsReq, env, ctx);
  assert(metricsRes.status === 200, '/router-metrics returned 200 OK');
  const metricsData = await metricsRes.json();
  console.log('  Metrics Summary Snapshot:', JSON.stringify(metricsData, null, 2));
  assert(metricsData.totalRequests > 200, `Total recorded requests > 200 (Actual: ${metricsData.totalRequests})`);
  assert(metricsData.failoverAttempts > 0, `Recorded failover attempts tracked (Actual: ${metricsData.failoverAttempts})`);

  console.log('\n================================================================');
  console.log(`  ALL TESTS PASSED: ${passedTests}/${totalTests} checks successful!`);
  console.log('================================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
