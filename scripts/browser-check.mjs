// Loads pages in a real browser and reports what a person would actually hit:
// uncaught exceptions, console errors, and horizontal overflow on a phone.
//
//   node scripts/browser-check.mjs <url> [...urls]        desktop
//   node scripts/browser-check.mjs --mobile <url> [...]   iPhone-sized viewport
//
// Start a browser with remote debugging first, e.g.
//   msedge --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/cdp
//
// This exists because of a bug nothing else caught. A client component imported
// a constant from the Mongoose model, so the model was evaluated in the browser
// and threw on hydration. The page server-rendered correctly, so curl reported
// 200 with the right HTML, tests passed, and the build was green — while
// /polls/create showed the error boundary to every real visitor. Status codes
// are not evidence that a page works.
//
// No dependencies: Node 22+ has a global WebSocket.

const args = process.argv.slice(2);
const mobile = args.includes('--mobile');
const urls = args.filter((a) => !a.startsWith('--'));
const CDP = process.env.CDP_URL ?? 'http://127.0.0.1:9222';

// iPhone 14-ish. Narrow enough to catch layouts that only work on a desktop.
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 3, mobile: true };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;

async function check(url) {
    const target = await (await fetch(`${CDP}/json/new?about:blank`, { method: 'PUT' })).json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    const problems = [];
    let id = 0;
    const send = (method, params = {}) => ws.send(JSON.stringify({ id: ++id, method, params }));

    await new Promise((resolve) => ws.addEventListener('open', resolve));

    ws.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);

        if (msg.method === 'Runtime.exceptionThrown') {
            problems.push({
                kind: 'uncaught',
                text: msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text,
            });
        } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
            problems.push({
                kind: 'console.error',
                text: msg.params.args.map((a) => a.description ?? a.value).join(' '),
            });
        }
    });

    send('Runtime.enable');
    send('Page.enable');
    if (mobile) send('Emulation.setDeviceMetricsOverride', VIEWPORT);

    send('Page.navigate', { url });
    await sleep(6000);

    send('Runtime.evaluate', {
        expression: `JSON.stringify({
            title: document.title,
            h1: document.querySelector('h1')?.textContent ?? null,
            // The classic phone bug: something wider than the screen, so the
            // whole page pans sideways.
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            hasHeader: !!document.querySelector('header'),
            text: document.body.innerText.slice(0, 90)
        })`,
        returnByValue: true,
    });

    const state = await new Promise((resolve) => {
        const onMessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.result?.result?.value) {
                ws.removeEventListener('message', onMessage);
                resolve(JSON.parse(msg.result.result.value));
            }
        };
        ws.addEventListener('message', onMessage);
        setTimeout(() => resolve(null), 4000);
    });

    ws.close();
    await fetch(`${CDP}/json/close/${target.id}`);

    // A couple of pixels is rounding; more than that is a real overflow.
    const overflow = state ? state.scrollWidth - state.innerWidth : 0;
    const bad = problems.length > 0 || overflow > 2;
    if (bad) failures++;

    console.log(`\n${bad ? 'FAIL' : 'ok  '}  ${url}`);
    console.log(`      title    ${state?.title ?? '(unknown)'}`);
    console.log(`      h1       ${state?.h1 ?? '(none)'}`);
    console.log(`      header   ${state?.hasHeader ? 'present' : 'MISSING'}`);
    console.log(
        `      width    content ${state?.scrollWidth}px in ${state?.innerWidth}px` +
            (overflow > 2 ? `  ← overflows by ${overflow}px` : ''),
    );

    for (const p of problems.slice(0, 5)) {
        console.log(`      [${p.kind}] ${String(p.text).split('\n')[0]}`);
    }
}

console.log(mobile ? `Checking ${urls.length} page(s) at ${VIEWPORT.width}px` : `Checking ${urls.length} page(s)`);

for (const url of urls) await check(url);

console.log(failures === 0 ? '\nall pages clean' : `\n${failures} page(s) with problems`);
process.exit(failures === 0 ? 0 : 1);
