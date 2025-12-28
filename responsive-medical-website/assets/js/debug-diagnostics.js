(function runDiagnostics() {
    const report = [];
    let hasCriticalError = false;

    function log(status, message) {
        report.push({ status, message });
        if (status === 'ERROR') hasCriticalError = true;
        console.log(`[Diagnostic] [${status}] ${message}`);
    }

    log('INFO', 'Starting diagnostics...');

    // 1. Check Environment Config
    if (window.APP_ENV) {
        log('OK', `Environment: ${window.APP_ENV.current}`);
    } else {
        log('ERROR', 'window.APP_ENV is missing. config/env.js might not be loaded.');
    }

    // 2. Check Firebase Config
    if (window.FIREBASE_CONFIG_TEST) {
        log('OK', 'Firebase Config (Test) found.');
        if (!window.FIREBASE_CONFIG_TEST.apiKey) log('ERROR', 'Firebase Config missing apiKey.');
    } else {
        log('ERROR', 'window.FIREBASE_CONFIG_TEST is missing. config/firebase-config.test.js might not be loaded.');
    }

    // 3. Check Firebase SDK
    if (typeof firebase !== 'undefined') {
        log('OK', `Firebase SDK loaded (Version: ${firebase.SDK_VERSION || 'unknown'}).`);
        if (typeof firebase.auth === 'function') {
            log('OK', 'Firebase Auth SDK loaded.');
        } else {
            log('ERROR', 'Firebase Auth SDK NOT loaded.');
        }
    } else {
        log('ERROR', 'window.firebase is undefined. Firebase CDN scripts failed to load. Check internet connection/ad blockers.');
    }

    // 4. Check Initialization
    if (window.firebaseInitError) {
        log('ERROR', `Firebase Initialization Error: ${window.firebaseInitError.message}`);
    } else if (window.firebaseAuth) {
        log('OK', 'window.firebaseAuth is initialized and ready.');
    } else {
        log('ERROR', 'window.firebaseAuth is NOT initialized, but no explicit error was caught.');
    }

    // Display Results if Critical
    if (hasCriticalError) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '0';
        div.style.left = '0';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.backgroundColor = 'rgba(0,0,0,0.9)';
        div.style.zIndex = '10000';
        div.style.color = '#ff4444';
        div.style.padding = '20px';
        div.style.overflow = 'auto';
        div.style.fontFamily = 'monospace';

        let html = '<h1>⚠️ Diagnostic Report ⚠️</h1>';
        html += '<p>Please share this screenshot with the developer.</p><hr>';

        report.forEach(item => {
            const color = item.status === 'OK' ? '#4caf50' : '#ff4444';
            html += `<div style="color: ${color}; margin-bottom: 5px;">[${item.status}] ${item.message}</div>`;
        });

        html += '<br><button onclick="this.parentElement.remove()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Close Diagnostics</button>';

        div.innerHTML = html;
        document.body.appendChild(div);
    }
})();
