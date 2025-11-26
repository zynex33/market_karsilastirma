import { Product } from '@/lib/types';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const getMarketColor = (market: string) => {
        switch (market) {
            case 'A101': return 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white border-cyan-400';
            case 'Şok': return 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border-yellow-400';
            case 'Migros': return 'bg-gradient-to-r from-orange-600 to-orange-500 text-white border-orange-400';
            default: return 'bg-gray-600 text-white';
        }
    };

    const getMarketLogo = (market: string) => {
        switch (market) {
            case 'A101': return '🅰️';
            case 'Şok': return '⚡';
            case 'Migros': return '🛒';
            default: return '🏪';
        }
    };

    // Fallback placeholder for missing images
    const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-size="16" font-family="Arial"%3EResim Yok%3C/text%3E%3C/svg%3E';
    const imageUrl = product.image || placeholderSvg;

    return (
        <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative h-full"
        >
            <div className="glass-panel rounded-xl overflow-hidden h-full hover:scale-[1.02] transition-transform duration-300 flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-square bg-white p-2 flex items-center justify-center overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== placeholderSvg) {
                                target.src = placeholderSvg;
                            }
                        }}
                    />
                    <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-md text-xs font-extrabold border-2 shadow-lg ${getMarketColor(product.market)}`}>
                        <span className="mr-1">{getMarketLogo(product.market)}</span>
                        {product.market}
                    </div>
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-grow">
                    <h3 className="text-gray-200 text-sm font-medium line-clamp-2 mb-2 flex-grow group-hover:text-blue-400 transition-colors" title={product.name}>
                        {product.name}
                    </h3>

                    <div className="flex items-end justify-between mt-auto">
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white leading-none">
                                {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                <span className="text-xs font-normal text-gray-400 ml-0.5">TL</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}
