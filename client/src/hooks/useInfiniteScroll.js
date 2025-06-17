import { useState, useEffect, useCallback } from 'react'

export function useInfiniteScroll(callback, options = {}) {
  const { threshold = 200, initialPage = 1 } = options
  const [isFetching, setIsFetching] = useState(false)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(true)

  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = document.documentElement.scrollTop
    const clientHeight = document.documentElement.clientHeight
    
    if (scrollHeight - scrollTop - clientHeight < threshold && !isFetching && hasMore) {
      setIsFetching(true)
    }
  }, [threshold, isFetching, hasMore])
  
  // Load more data when isFetching becomes true
  useEffect(() => {
    if (!isFetching) return
    
    const loadMore = async () => {
      try {
        const result = await callback(page)
        
        if (!result || (Array.isArray(result) && result.length === 0)) {
          setHasMore(false)
        } else {
          setPage(prevPage => prevPage + 1)
        }
      } catch (error) {
        console.error('Error loading more data:', error)
      } finally {
        setIsFetching(false)
      }
    }
    
    loadMore()
  }, [isFetching, page, callback])
  
  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])
  
  return { isFetching, hasMore, page, setPage, resetPage: () => setPage(initialPage), setHasMore }
}
