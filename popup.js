document.addEventListener('DOMContentLoaded', () => {
    const markdownOutput = document.getElementById('markdown-output');
    const statusEl = document.getElementById('status');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    let articleTitle = '';
    let articleUrl = '';

    // Initialize the Turndown service to convert HTML to Markdown.
    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        emDelimiter: '*',
    });

    // Add a rule for handling tables, as required.
    turndownService.use(turndownPluginGfm.gfm);

    /**
     * Sanitizes a string to be used as a valid filename.
     * @param {string} name The string to sanitize.
     * @returns {string} The sanitized filename.
     */
    function sanitizeFilename(name) {
        // Remove invalid characters and replace spaces with hyphens
        return name.replace(/[\/\?%*:|"<>]/g, '').replace(/\s+/g, '-').toLowerCase();
    }

    /**
     * Handles the response from the background script.
     * @param {object} response The article data or error message.
     */
    function handleResponse(response) {
        if (response && !response.error) {
            articleTitle = response.title;
            articleUrl = response.url;

            // Generate metadata header
            const now = new Date();
            const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const metadata = `> **Source:** [${articleTitle}](${articleUrl})
> **Saved:** ${dateString}

---

`;

            // Convert HTML to Markdown
            const markdown = turndownService.turndown(response.content);

            // Set the final content in the textarea
            markdownOutput.value = metadata + markdown;

            statusEl.textContent = 'Ready to copy or download.';
            copyBtn.disabled = false;
            downloadBtn.disabled = false;
        } else {
            const errorMessage = response ? response.error : 'An unknown error occurred.';
            markdownOutput.value = `Error: ${errorMessage}

Please try a different page. This extension works best on pages with a clear article structure.`;
            statusEl.textContent = 'Failed to find an article.';
            copyBtn.disabled = true;
            downloadBtn.disabled = true;
        }
    }

    // Send a message to the background script to start the extraction process.
    chrome.runtime.sendMessage({ action: "extract_content" }, handleResponse);

    // Event listener for the "Copy" button
    copyBtn.addEventListener('click', () => {
        markdownOutput.select();
        document.execCommand('copy'); // Using execCommand for simplicity in extensions

        // Provide visual feedback
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy to Clipboard';
        }, 2000);
    });

    // Event listener for the "Download" button
    downloadBtn.addEventListener('click', () => {
        const content = markdownOutput.value;
        const filename = sanitizeFilename(articleTitle) + '.md';

        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });

        // Use the chrome.downloads API
        chrome.downloads.download({
            url: URL.createObjectURL(blob),
            filename: filename,
            saveAs: true // Prompts the user for a save location
        });
    });
});
