// Function to track a visit
function trackVisit() {
    // Get referrer
    const referrer = document.referrer || '(direct)';

    // Get UTM source from URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || null;

    // Send data to backend
    fetch('http://localhost:3000/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            referrer: referrer,
            utm_source: utmSource
        })
    });

    // Track time on page (simple implementation)
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const duration = Math.round((Date.now() - startTime) / 1000); // in seconds
        // Send duration on page exit
        navigator.sendBeacon('http://localhost:3000/track', JSON.stringify({
            duration: duration,
            referrer: referrer,
            utm_source: utmSource
        }));
    });
}

// Start tracking when page loads
document.addEventListener('DOMContentLoaded', trackVisit);