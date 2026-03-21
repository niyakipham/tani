'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
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

  // Reset state when query changes
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setIsInitialLoad(true);
  }, [query]);

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

      {isInitialLoad && isFetching ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-[#3B82F6] mb-4" />
          <div className="text-[#808191] font-medium">Đang tìm kiếm dữ liệu...</div>
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-md:gap-4">
            {movies.map((item, idx) => (
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
