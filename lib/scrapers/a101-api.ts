import { Product } from '../types';
import * as https from 'https';

export async function searchA101(query: string): Promise<Product[]> {
    return new Promise((resolve, reject) => {
        try {
            // A101 WAWLabs search API
            const url = `https://a101.wawlabs.com/search?q=${encodeURIComponent(query)}&pn=1&rpp=60&filter=available:true`;

            console.log(`A101 API: ${url}`);

            https.get(url, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const products: Product[] = [];

                        // Products are in res[0].page_content array
                        if (json.res && Array.isArray(json.res) && json.res.length > 0) {
                            const pageContent = json.res[0].page_content;

                            if (Array.isArray(pageContent)) {
                                pageContent.forEach((item: any) => {
                                    if (item.available && item.price > 0) {
                                        // Find product image (skip badges)
                                        const productImage = item.image?.find((img: any) =>
                                            img.imageType === 'product'
                                        );

                                        products.push({
                                            name: item.title || '',
                                            price: item.price,
                                            image: productImage?.url || (item.image?.[0]?.url) || '',
                                            market: 'A101',
                                            url: item.seoUrl || item.link || `https://www.a101.com.tr/kapida/search?query=${encodeURIComponent(query)}`
                                        });
                                    }
                                });
                            }
                        }

                        console.log(`A101 found: ${products.length} products`);
                        resolve(products);
                    } catch (error) {
                        console.error('A101 JSON parse error:', error);
                        resolve([]); // Return empty array instead of crash
                    }
                });
            }).on('error', (error) => {
                console.error('A101 API error:', error);
                resolve([]); // Return empty array instead of crash
            });

        } catch (error) {
            console.error('A101 error:', error);
            resolve([]);
        }
    });
}
