import axios from 'axios';
import * as cheerio from 'cheerio';
import { Product } from '../types';

export async function searchSok(query: string): Promise<Product[]> {
    try {
        const url = `https://www.sokmarket.com.tr/arama?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const products: Product[] = [];

        $('div[class*="CProductCard-module_productCardWrapper"]').each((_, element) => {
            const title = $(element).find('h2[class*="CProductCard-module_title"]').text().trim();
            const priceText = $(element).find('span[class*="CPriceBox-module_price"]').text().trim();
            const image = $(element).find('img').attr('src') || '';
            const link = $(element).closest('a').attr('href');

            if (title && priceText) {
                const price = parseFloat(
                    priceText.replace('₺', '').replace(/\./g, '').replace(',', '.').trim()
                );

                products.push({
                    name: title,
                    price,
                    image,
                    market: 'Şok',
                    url: link ? `https://www.sokmarket.com.tr${link}` : url
                });
            }
        });

        return products;
    } catch (error) {
        console.error('Şok error:', error);
        return [];
    }
}
