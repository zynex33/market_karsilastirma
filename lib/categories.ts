// Category definitions and mapping utilities

export interface Category {
    slug: string;
    name: string;
    emoji: string;
}

export const CATEGORIES: Category[] = [
    { slug: 'meyve-sebze', name: 'Meyve & Sebze', emoji: '🥬' },
    { slug: 'et-tavuk-balik', name: 'Et, Tavuk & Balık', emoji: '🍖' },
    { slug: 'sut-kahvaltilik', name: 'Süt Ürünleri & Kahvaltılık', emoji: '🥛' },
    { slug: 'atistirmalik', name: 'Atıştırmalık', emoji: '🍿' },
    { slug: 'icecek', name: 'İçecek', emoji: '🥤' },
    { slug: 'temel-gida', name: 'Temel Gıda', emoji: '🌾' },
    { slug: 'temizlik', name: 'Temizlik', emoji: '🧼' },
    { slug: 'kisisel-bakim', name: 'Kişisel Bakım', emoji: '🧴' },
    { slug: 'diger', name: 'Diğer', emoji: '📦' }
];

/**
 * Maps a product to a category based on API category or product name keywords
 */
export function mapProductCategory(productName: string, apiCategory?: string): string {
    const name = productName.toLowerCase();
    const category = apiCategory?.toLowerCase() || '';

    // Priority 1: Use API category if available and clear
    if (category) {
        if (category.includes('süt') || category.includes('yoğurt') || category.includes('peynir') ||
            category.includes('kahvaltı') || category.includes('yumurta')) {
            return 'sut-kahvaltilik';
        }
        if (category.includes('meyve') || category.includes('sebze')) {
            return 'meyve-sebze';
        }
        if (category.includes('et') || category.includes('tavuk') || category.includes('balık') ||
            category.includes('hindi') || category.includes('salam')) {
            return 'et-tavuk-balik';
        }
        if (category.includes('içecek') || category.includes('su') || category.includes('meyve suyu')) {
            return 'icecek';
        }
        if (category.includes('cips') || category.includes('çikolata') || category.includes('bisküvi') ||
            category.includes('gofret')) {
            return 'atistirmalik';
        }
        if (category.includes('temizlik') || category.includes('deterjan')) {
            return 'temizlik';
        }
        if (category.includes('kişisel bakım') || category.includes('şampuan') || category.includes('sabun')) {
            return 'kisisel-bakim';
        }
    }

    // Priority 2: Keyword matching on product name
    // Süt Ürünleri & Kahvaltılık
    if (name.includes('süt') || name.includes('yoğurt') || name.includes('peynir') ||
        name.includes('tereyağ') || name.includes('margarin') || name.includes('yumurta') ||
        name.includes('bal') || name.includes('reçel') || name.includes('zeytin')) {
        return 'sut-kahvaltilik';
    }

    // Meyve & Sebze
    if (name.includes('domates') || name.includes('biber') || name.includes('salatalık') ||
        name.includes('marul') || name.includes('elma') || name.includes('portakal') ||
        name.includes('muz') || name.includes('üzüm') || name.includes('patates') ||
        name.includes('soğan') || name.includes('havuç')) {
        return 'meyve-sebze';
    }

    // Et, Tavuk & Balık
    if (name.includes('et') || name.includes('tavuk') || name.includes('balık') ||
        name.includes('köfte') || name.includes('sosis') || name.includes('salam') ||
        name.includes('sucuk') || name.includes('hindi') || name.includes('döner')) {
        return 'et-tavuk-balik';
    }

    // İçecek
    if (name.includes('su') || name.includes('kola') || name.includes('gazoz') ||
        name.includes('çay') || name.includes('kahve') || name.includes('meyve suyu') ||
        name.includes('ayran') || name.includes('soda') || name.includes('limonata')) {
        return 'icecek';
    }

    // Atıştırmalık
    if (name.includes('cips') || name.includes('çikolata') || name.includes('bisküvi') ||
        name.includes('gofret') || name.includes('kek') || name.includes('kraker') ||
        name.includes('bar') || name.includes('şeker') || name.includes('kuruyemiş')) {
        return 'atistirmalik';
    }

    // Temel Gıda
    if (name.includes('un') || name.includes('pirinç') || name.includes('makarna') ||
        name.includes('bulgur') || name.includes('mercimek') || name.includes('nohut') ||
        name.includes('fasulye') || name.includes('ekmek')) {
        return 'temel-gida';
    }

    // Temizlik
    if (name.includes('deterjan') || name.includes('çamaşır') || name.includes('bulaşık') ||
        name.includes('yumuşatıcı') || name.includes('kağıt havlu') || name.includes('tuvalet kağıdı') ||
        name.includes('çöp torbası')) {
        return 'temizlik';
    }

    // Kişisel Bakım
    if (name.includes('şampuan') || name.includes('sabun') || name.includes('diş') ||
        name.includes('traş') || name.includes('deodorant') || name.includes('krem')) {
        return 'kisisel-bakim';
    }

    // Default
    return 'diger';
}

/**
 * Get category info by slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
    return CATEGORIES.find(c => c.slug === slug);
}
