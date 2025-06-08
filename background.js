// background.js
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

            // Inject the Readability.js library first.
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['Readability.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error injecting Readability.js:", chrome.runtime.lastError);
                    sendResponse({ error: "Failed to inject Readability.js: " + chrome.runtime.lastError.message });
                    return;
                }

                // Now, inject the content extraction logic as a function.
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: () => {
                        // This IIFE will be stringified and executed on the page.
                        // It's the same logic as content.js
                        const documentClone = document.cloneNode(true);
                        if (typeof Readability === 'undefined') {
                            return { error: "Readability library not found (func injection context)." };
                        }
                        const reader = new Readability(documentClone);
                        const article = reader.parse();
                        if (article) {
                            return {
                                title: article.title,
                                content: article.content,
                                url: window.location.href
                            };
                        }
                        return { error: "Could not find an article on this page (Readability parse failed in func)." };
                    }
                }, (injectionResults) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error injecting content extraction function:", chrome.runtime.lastError);
                        sendResponse({ error: "Failed to inject content extraction function: " + chrome.runtime.lastError.message });
                    } else if (injectionResults && injectionResults[0] && injectionResults[0].result) {
                        sendResponse(injectionResults[0].result);
                    } else {
                        // This case might occur if the injected function doesn't return a result,
                        // or if injectionResults is structured unexpectedly.
                        sendResponse({ error: "Could not extract article (no result from injected function)." });
                    }
                });
            });
        });
        return true; // Indicates that we will send a response asynchronously.
    }
});
