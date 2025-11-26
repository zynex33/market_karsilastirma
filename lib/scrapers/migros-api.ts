import { Product } from '../types';
import * as https from 'https';

export async function searchMigros(query: string): Promise<Product[]> {
    return new Promise((resolve, reject) => {
        try {
            const url = `https://www.migros.com.tr/rest/search/screens/products?q=${encodeURIComponent(query)}`;

            console.log(`Migros API: ${url}`);

            https.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            }, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const products: Product[] = [];

                        // Products are in data.searchInfo.storeProductInfos
                        if (json.successful && json.data?.searchInfo?.storeProductInfos) {
                            const storeProducts = json.data.searchInfo.storeProductInfos;

                            storeProducts.forEach((item: any) => {
                                // Get product name
                                const name = item.name || '';

                                // Get price (values are in kuruş, so divide by 100)
                                const rawPrice = item.shownPrice || item.regularPrice || 0;
                                const price = rawPrice / 100;

                                // Get image URL (Prioritize HD > Detail > List)
                                const imageUrl = item.images?.[0]?.urls?.PRODUCT_HD ||
                                    item.images?.[0]?.urls?.PRODUCT_DETAIL ||
                                    item.images?.[0]?.urls?.PRODUCT_LIST ||
                                    '';

                                // Get product URL
                                // prettyName usually contains the full slug including ID, e.g. "product-name-p-id"
                                const productUrl = item.prettyName
                                    ? `https://www.migros.com.tr/${item.prettyName}`
                                    : `https://www.migros.com.tr/arama?q=${encodeURIComponent(query)}`;

                                if (name && price > 0) {
                                    products.push({
                                        name: name,
                                        price: price,
                                        image: imageUrl,
                                        market: 'Migros',
                                        url: productUrl
                                    });
                                }
                            });
                        }

                        console.log(`Migros found: ${products.length} products`);
                        resolve(products);
                    } catch (error) {
                        console.error('Migros JSON parse error:', error);
                        resolve([]); // Return empty array instead of crash
                    }
                });
            }).on('error', (error) => {
                console.error('Migros API error:', error);
                resolve([]); // Return empty array instead of crash
            });

        } catch (error) {
            console.error('Migros error:', error);
            resolve([]);
        }
    });
}
