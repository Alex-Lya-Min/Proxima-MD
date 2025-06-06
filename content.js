// Use an IIFE (Immediately Invoked Function Expression) to avoid polluting the global scope.
(() => {
    // Clone the document to avoid modifying the live page.
    const documentClone = document.cloneNode(true);

    // The Readability library is expected to be available in the global scope
    // because background.js injects it before this script.
    if (typeof Readability === 'undefined') {
        return { error: "Readability library not found." };
    }

    // Parse the cloned document with Readability.
    const reader = new Readability(documentClone);
    const article = reader.parse();

    // The 'article' object contains the extracted content.
    // We only send back the necessary parts to the popup.
    if (article) {
        return {
            title: article.title,
            content: article.content, // This is the main HTML content of the article
            url: window.location.href
        };
    }

    // Return an error if no article could be parsed.
    return { error: "Could not find an article on this page." };
})();
