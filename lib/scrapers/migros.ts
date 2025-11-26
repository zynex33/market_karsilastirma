import puppeteer from 'puppeteer';
import { Product } from '../types';

export async function searchMigros(query: string): Promise<Product[]> {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        const url = `https://www.migros.com.tr/arama?q=${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        // Scroll page to trigger lazy loading
        for (let i = 0; i < 10; i++) {
            await page.evaluate('window.scrollBy(0, 300)');
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const products = await page.evaluate(() => {
            const items = document.querySelectorAll('sm-list-page-item');
            const results: any[] = [];

            items.forEach((item) => {
                const nameEl = item.querySelector('.product-name');
                const priceEl = item.querySelector('.price');
                const imageEl = item.querySelector('img');
                const linkEl = item.querySelector('a');

                if (nameEl && priceEl) {
                    const name = nameEl.textContent?.trim() || '';
                    const priceText = priceEl.textContent?.trim() || '';
                    const price = parseFloat(priceText.replace('TL', '').replace(/\./g, '').replace(',', '.').trim());

                    results.push({
                        name: name,
                        price: price,
                        image: imageEl ? imageEl.src : '',
                        market: 'Migros',
                        url: linkEl ? linkEl.href : ''
                    });
                }
            });

            return results;
        });

        await browser.close();
        return products;
    } catch (error) {
        console.error('Migros error:', error);
        if (browser) await browser.close();
        return [];
    }
}
