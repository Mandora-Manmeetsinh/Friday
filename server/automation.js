/* eslint-env node */
import { launch } from 'puppeteer';

/**
 * Executes a web automation command using Puppeteer.
 * @param {Object} command - The structured command object from the AI.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function executeAutomation(command) {
    const browser = await launch({
        headless: false, // Show the browser for visual confirmation
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();
    const action = command?.action || 'unknown';
    const query = command?.query || '';

    try {
        if (action === 'open_site' || action === 'github_search') {
            await page.goto('https://github.com', { waitUntil: 'networkidle2' });
            if (action === 'github_search' && query) {
                // To search Github, we can navigate directly to the search URL
                await page.goto(`https://github.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
                return { success: true, message: `Successfully searched GitHub for "${query}".` };
            }
            return { success: true, message: 'Successfully opened GitHub.' };
        }

        if (action === 'search_google') {
            await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });
            await page.type('textarea[name="q"]', query || 'FRIDAY AI');
            await page.keyboard.press('Enter');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            return { success: true, message: `Searched Google for "${query || 'FRIDAY AI'}"` };
        }

        if (action === 'youtube_search') {
            await page.goto('https://www.youtube.com', { waitUntil: 'networkidle2' });
            await page.type('input#search', query || 'Iron Man FRIDAY');
            await page.keyboard.press('Enter');
            return { success: true, message: `Searching YouTube for "${query || 'Iron Man FRIDAY'}"` };
        }

        await browser.close();
        return { success: false, message: `Command action '${action}' not recognized by the automation engine.` };

    } catch (error) {
        console.error('Automation Error:', error);
        await browser.close();
        return { success: false, message: `Automation failed: ${error.message}` };
    }
}

export { executeAutomation };
