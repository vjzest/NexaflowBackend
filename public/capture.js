/**
 * AutoSAAS Lead Capture Snippet
 * Usage: 
 * 1. Include this script in your website.
 * 2. Initialize with your API Key.
 * 3. Call AutoSAAS.capture({ name, email, phone, data })
 */

window.AutoSAAS = (function () {
    let apiKey = '';
    const API_URL = 'http://localhost:5000/api/leads/capture'; // Update to production URL later

    return {
        init: function (key) {
            apiKey = key;
            console.log('AutoSAAS initialized successfully.');
        },
        capture: async function (leadData) {
            if (!apiKey) {
                console.error('AutoSAAS: API Key not set. Call init() first.');
                return;
            }

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        apiKey: apiKey,
                        ...leadData
                    }),
                });

                const result = await response.json();
                if (response.ok) {
                    console.log('AutoSAAS: Lead captured successfully:', result.leadId);
                    return result;
                } else {
                    console.error('AutoSAAS: Capture failed:', result.message);
                }
            } catch (error) {
                console.error('AutoSAAS: Network error:', error.message);
            }
        }
    };
})();
