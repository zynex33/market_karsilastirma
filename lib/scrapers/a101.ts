import puppeteer from 'puppeteer';
import { Product } from '../types';

export async function searchA101(query: string): Promise<Product[]> {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-geolocation' // Disable geolocation explicitly
            ]
        });
        const page = await browser.newPage();

        // Block geolocation permissions
        const context = browser.defaultBrowserContext();
        await context.overridePermissions('https://www.a101.com.tr', []);

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        // Intercept network requests to get raw JSON data
        const apiResponses: any[] = [];
        page.on('response', async response => {
            const url = response.url();
            // Target the specific search API
            if (url.includes('wawlabs.com/search')) {
                try {
                    const contentType = response.headers()['content-type'];
                    if (contentType && contentType.includes('application/json')) {
                        const json = await response.json();
                        apiResponses.push({ url, data: json });
                    }
                } catch (e) {
                    // Ignore
                }
            }
        });

        // Go to A101 Kapıda
        await page.goto('https://www.a101.com.tr/kapida', { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Type in search bar
        try {
            // Wait for search bar (might be different on Kapıda, but usually same ID or class)
            // Using a generic strategy to find the search input if ID fails
            const searchSelector = '#onlineSearchBar, input[type="search"], input[placeholder*="Ara"]';
            await page.waitForSelector(searchSelector, { timeout: 15000 });

            await page.type(searchSelector, query);
            await page.keyboard.press('Enter');

            // Wait for network activity to settle
            await new Promise(r => setTimeout(r, 5000));

            // Scroll to trigger more requests (lazy loading)
            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => window.scrollBy(0, window.innerHeight));
                await new Promise(r => setTimeout(r, 2000));
            }
        } catch (e) {
            console.log('A101 search interaction failed:', e);
            await browser.close();
            return [];
        }

        // Process captured API data
        let products: any[] = [];

        apiResponses.forEach(res => {
            // Products are in 'res' array in the search API response
            const found = res.data?.res || [];
            if (Array.isArray(found) && found.length > 0) {
                products = products.concat(found);
            }
        });

        // Deduplicate and map to Product interface
        const uniqueProducts: Product[] = [];
        const seenNames = new Set();

        products.forEach(p => {
            const name = p.name || p.productName || p.title;

            // Since we are on Kapıda, we assume most products are market products.
            // But we still filter out "Online Satışa Özel" just in case.
            const isOnlineExclusive = p.attributes?.channelNames?.includes('Online Satışa Özel');

            if (name && !seenNames.has(name) && !isOnlineExclusive) {
                seenNames.add(name);

                // Extract fields based on JSON analysis
                const priceVal = p.price?.discounted || p.price?.current || p.salePrice || 0;
                // Prices in JSON might be in cents
                const price = priceVal > 10000 ? priceVal / 100 : priceVal;

                const image = p.images?.[0]?.url || p.image || p.imageUrl || '';
                const url = p.attributes?.url || p.url || (p.slug ? `https://www.a101.com.tr${p.slug.startsWith('/') ? '' : '/'}${p.slug}` : '');

                if (price > 0) {
                    uniqueProducts.push({
                        name: name,
                        price: price,
                        image: image,
                        market: 'A101',
                        url: url || `https://www.a101.com.tr/kapida/arama?k=${encodeURIComponent(query)}`
                    });
                }
            }
        });

        await browser.close();
        return uniqueProducts;
    } catch (error) {
        console.error('A101 error:', error);
        if (browser) await browser.close();
        return [];
    }
}
