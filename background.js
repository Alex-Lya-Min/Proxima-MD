// Listen for a message from the popup script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extract_content") {
        // Get the active tab to inject scripts into.
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                console.error("No active tab found.");
                sendResponse({ error: "No active tab found." });
                return;
            }
            const tabId = tabs[0].id;

            // Inject the Readability.js library, then the content script.
            // This ensures Readability is available when content.js runs.
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['Readability.js']
            }, () => {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }, (injectionResults) => {
                    // The result from the content script is in injectionResults.
                    // Send it back to the popup.
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        sendResponse({ error: chrome.runtime.lastError.message });
                    } else if (injectionResults && injectionResults[0] && injectionResults[0].result) {
                        sendResponse(injectionResults[0].result);
                    } else {
                        sendResponse({ error: "Could not extract article." });
                    }
                });
            });
        });

        // Return true to indicate that we will send a response asynchronously.
        return true;
    }
});
