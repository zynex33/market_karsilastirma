import { Product } from './types';
import { searchA101 } from './scrapers/a101-api';
import { searchSok } from './scrapers/sok';
import { searchMigros } from './scrapers/migros-api';

export type { Product };

export async function searchProducts(query: string): Promise<Product[]> {
    try {
        console.log(`Starting search for: ${query}`);

        const [a101Results, sokResults, migrosResults] = await Promise.all([
            searchA101(query).catch(e => {
                console.error('A101 failed:', e);
                return [];
            }),
            searchSok(query).catch(e => {
                console.error('Sok failed:', e);
                return [];
            }),
            searchMigros(query).catch(e => {
                console.error('Migros failed:', e);
                return [];
            })
        ]);

        const allProducts = [...a101Results, ...sokResults, ...migrosResults];
        console.log(`Total products found: ${allProducts.length}`);

        return allProducts.sort((a, b) => a.price - b.price);
    } catch (error) {
        console.error('Critical error in searchProducts:', error);
        throw error;
    }
}
