'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, Filter, Calendar, Monitor } from 'lucide-react';
import { searchMovies } from '@/lib/api';
import { useAppContext } from '@/lib/store';
import { MovieCard } from '@/components/ExploreSection';

export const SearchResults = ({ query }: { query: string }) => {
  const router = useRouter();
  const { setCurrentMovieSlug } = useAppContext();
  const [movies, setMovies] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('');

  // Reset state when query changes
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setIsInitialLoad(true);
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedQuality('');
  }, [query]);

  const { availableGenres, availableYears, availableQualities, filteredMovies } = useMemo(() => {
    const genresSet = new Set<string>();
    const yearsSet = new Set<string>();
    const qualitiesSet = new Set<string>();

    movies.forEach(m => {
      // Bóc tách category/the-loai
      if (m.category && Array.isArray(m.category)) {
        m.category.forEach((c: any) => genresSet.add(c.name));
      } else if (m.type_name) {
        genresSet.add(m.type_name);
      }
      
      if (m.year) yearsSet.add(m.year.toString());
      if (m.quality) qualitiesSet.add(m.quality);
    });

    const filtered = movies.filter(m => {
      const matchGenre = selectedGenre ? (m.category?.some((c: any) => c.name === selectedGenre) || m.type_name === selectedGenre) : true;
      const matchYear = selectedYear ? m.year?.toString() === selectedYear : true;
      const matchQuality = selectedQuality ? m.quality === selectedQuality : true;
      return matchGenre && matchYear && matchQuality;
    });

    return {
      availableGenres: Array.from(genresSet).sort(),
      availableYears: Array.from(yearsSet).sort().reverse(),
      availableQualities: Array.from(qualitiesSet).sort(),
      filteredMovies: filtered
    };
  }, [movies, selectedGenre, selectedYear, selectedQuality]);

  const fetchResults = useCallback(async (pageNum: number, isNewQuery: boolean) => {
    if (!query) return;
    
    setIsFetching(true);
    try {
      const data = await searchMovies(query, pageNum);
      if (data.status === 'success' && data.data.items && data.data.items.length > 0) {
        setMovies(prev => isNewQuery ? data.data.items : [...prev, ...data.data.items]);
        
        const pagination = data.data.params?.pagination;
        if (pagination && pagination.totalPages !== undefined) {
          setHasMore(pagination.currentPage < pagination.totalPages);
        } else {
          setHasMore(data.data.items.length >= 24);
        }
      } else {
        if (isNewQuery) setMovies([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
      if (isNewQuery) setMovies([]);
      setHasMore(false);
    } finally {
      setIsFetching(false);
      setIsInitialLoad(false);
    }
  }, [query]);

  // Fetch initial page
  useEffect(() => {
    if (query && isInitialLoad) {
      fetchResults(1, true);
    } else if (!query) {
      setMovies([]);
      setIsFetching(false);
      setHasMore(false);
      setIsInitialLoad(false);
    }
  }, [query, isInitialLoad, fetchResults]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isFetching && !isInitialLoad) {
          setPage(prev => {
            const nextPage = prev + 1;
            fetchResults(nextPage, false);
            return nextPage;
          });
        }
      },
      { rootMargin: '0px 0px 800px 0px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isFetching, isInitialLoad, fetchResults]);

  return (
    <section className="mt-4 bg-white dark:bg-[#252836] rounded-[40px] p-10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] shadow-[0_20px_40px_rgba(18,38,63,0.05)] max-md:p-6 max-md:mx-4 max-md:rounded-3xl min-h-[500px]">
      <div className="flex items-center gap-4 mb-8 max-md:mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
          <Search size={24} />
        </div>
        <div>
          <h2 className="text-[1.8rem] max-md:text-[1.4rem] font-black text-black dark:text-white tracking-[-0.5px]">
            Kết Quả Tìm Kiếm
          </h2>
          <p className="text-[0.95rem] text-[#808191] font-medium mt-1">
            {query ? `Hiển thị kết quả cho "${query}"` : 'Vui lòng nhập từ khóa tìm kiếm'}
          </p>
        </div>
      </div>

      {/* Filter UI */}
      {movies.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="relative flex items-center bg-[#F1F5F9] dark:bg-[#353945] border border-transparent rounded-2xl px-5 py-3 hover:bg-[#E2E8F0] dark:hover:bg-[#474D5C] transition-colors shadow-sm">
            <Filter size={18} className="text-[#808191] mr-2.5" />
            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-transparent border-none text-[0.95rem] font-bold text-black dark:text-white outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="" className="text-black dark:text-white bg-white dark:bg-[#252836]">Tất cả thể loại</option>
              {availableGenres.map(g => <option key={g} value={g} className="text-black dark:text-white bg-white dark:bg-[#252836]">{g}</option>)}
            </select>
          </div>

          <div className="relative flex items-center bg-[#F1F5F9] dark:bg-[#353945] border border-transparent rounded-2xl px-5 py-3 hover:bg-[#E2E8F0] dark:hover:bg-[#474D5C] transition-colors shadow-sm">
            <Calendar size={18} className="text-[#808191] mr-2.5" />
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent border-none text-[0.95rem] font-bold text-black dark:text-white outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="" className="text-black dark:text-white bg-white dark:bg-[#252836]">Tất cả năm</option>
              {availableYears.map(y => <option key={y} value={y} className="text-black dark:text-white bg-white dark:bg-[#252836]">{y}</option>)}
            </select>
          </div>

          <div className="relative flex items-center bg-[#F1F5F9] dark:bg-[#353945] border border-transparent rounded-2xl px-5 py-3 hover:bg-[#E2E8F0] dark:hover:bg-[#474D5C] transition-colors shadow-sm">
            <Monitor size={18} className="text-[#808191] mr-2.5" />
            <select 
              value={selectedQuality} 
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="bg-transparent border-none text-[0.95rem] font-bold text-black dark:text-white outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="" className="text-black dark:text-white bg-white dark:bg-[#252836]">Mọi chất lượng</option>
              {availableQualities.map(q => <option key={q} value={q} className="text-black dark:text-white bg-white dark:bg-[#252836]">{q}</option>)}
            </select>
          </div>
        </div>
      )}

      {isInitialLoad && isFetching ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-[#3B82F6] mb-4" />
          <div className="text-[#808191] font-medium">Đang tìm kiếm dữ liệu...</div>
        </div>
      ) : movies.length > 0 ? (
        <>
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-md:gap-4">
              {filteredMovies.map((item, idx) => (
                <MovieCard 
                  key={`${item.slug}-${idx}`} 
                  item={item} 
                  onClick={() => { 
                    setCurrentMovieSlug(item.slug); 
                    router.push('/');
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-[#F8FAFC] dark:bg-[#1A1C23] rounded-3xl border border-dashed border-black/10 dark:border-white/10">
              <Filter size={48} className="text-[#808191] mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-black dark:text-white mb-2">Không có kết quả lọc</h3>
              <p className="text-[#808191] max-w-[400px]">Không tìm thấy anime nào thỏa mãn bộ lọc hiện tại trong số các kết quả đã tải.</p>
            </div>
          )}
          
          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-10">
              {isFetching && (
                <div className="flex items-center gap-3 text-[#808191] font-medium">
                  <Loader2 size={24} className="animate-spin text-[#3B82F6]" />
                  Đang tải thêm kết quả...
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-[#F1F5F9] dark:bg-[#353945] flex items-center justify-center text-[#808191] mb-6">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">
            {query ? 'Không tìm thấy kết quả' : 'Bắt đầu tìm kiếm'}
          </h3>
          <p className="text-[#808191]">
            {query ? (
              <>
                Rất tiếc, chúng tôi không tìm thấy anime nào phù hợp với từ khóa &quot;{query}&quot;.<br />
                Vui lòng thử lại với từ khóa khác.
              </>
            ) : (
              'Nhập tên anime bạn muốn tìm vào thanh tìm kiếm phía trên.'
            )}
          </p>
        </div>
      )}
    </section>
  );
};
