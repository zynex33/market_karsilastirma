'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

export default function Home() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters & Sorting
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setProducts([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMarket = (market: string) => {
    setSelectedMarkets(prev =>
      prev.includes(market)
        ? prev.filter(m => m !== market)
        : [...prev, market]
    );
  };

  const filteredProducts = useMemo(() => {
    // If no markets selected, show all products
    let result = selectedMarkets.length === 0
      ? products
      : products.filter(p => selectedMarkets.includes(p.market));

    result.sort((a, b) => {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });

    return result;
  }, [products, selectedMarkets, sortOrder]);

  const stats = useMemo(() => {
    if (filteredProducts.length === 0) return null;
    const prices = filteredProducts.map(p => p.price);
    const minPrice = Math.min(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { count: filteredProducts.length, min: minPrice, avg: avgPrice };
  }, [filteredProducts]);

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8">
      <div className={`w-full max-w-7xl transition-all duration-700 ${hasSearched ? 'mt-0' : 'mt-[20vh]'}`}>

        {/* Header Section */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
            Market Fiyatları
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            A101, Şok ve Migros fiyatlarını tek tıkla karşılaştırın.
          </p>
        </div>

        {/* Search Section */}
        <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto mb-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün ara... (örn: süt, çay)"
              className="w-full px-6 py-4 rounded-xl glass-input text-lg shadow-2xl"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 h-[calc(100%-16px)]"
            >
              {loading ? '...' : 'Ara'}
            </button>
          </div>
        </form>

        {/* Filters & Stats Bar */}
        {hasSearched && !loading && (
          <div className="glass-panel rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Market Filters */}
            <div className="flex items-center gap-4">
              {['A101', 'Şok', 'Migros'].map(market => (
                <label key={market} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedMarkets.includes(market)}
                    onChange={() => toggleMarket(market)}
                    className="w-4 h-4 rounded border-gray-500 text-blue-600 focus:ring-blue-500 bg-white/10"
                  />
                  <span className={`text-sm font-medium ${selectedMarkets.includes(market) ? 'text-white' : 'text-gray-500'}`}>
                    {market}
                  </span>
                </label>
              ))}
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-gray-400">
                  Toplam: <span className="text-white font-bold">{stats.count}</span>
                </div>
                <div className="text-gray-400">
                  En Ucuz: <span className="text-green-400 font-bold">{stats.min.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="text-gray-400">
                  Ortalama: <span className="text-blue-400 font-bold">{stats.avg.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL</span>
                </div>
              </div>
            )}

            {/* Sort */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="asc" className="bg-gray-900">En Düşük Fiyat</option>
              <option value="desc" className="bg-gray-900">En Yüksek Fiyat</option>
            </select>
          </div>
        )}

        {/* Results Section */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl glass-panel"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        )}

        {!loading && hasSearched && filteredProducts.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-xl">Sonuç bulunamadı.</p>
          </div>
        )}
      </div>
    </main>
  );
}
