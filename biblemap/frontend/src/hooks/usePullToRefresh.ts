import { useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  refreshingHeight?: number;
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  refreshingHeight = 60,
  disabled = false,
}: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startY.current = touch.clientY;

      // Only allow pull-to-refresh when at the top of the page
      if (window.scrollY === 0) {
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || startY.current === null || isRefreshing) return;

      const touch = e.touches[0];
      currentY.current = touch.clientY;
      const deltaY = currentY.current - startY.current;

      if (deltaY > 0 && window.scrollY === 0) {
        e.preventDefault();
        // Apply resistance
        const resistance = 2.5;
        const adjustedDistance = Math.min(deltaY / resistance, threshold * 1.5);
        setPullDistance(adjustedDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling || !startY.current || !currentY.current) {
        return;
      }

      const deltaY = currentY.current - startY.current;

      if (deltaY >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(refreshingHeight);

        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }

      setIsPulling(false);
      startY.current = null;
      currentY.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, onRefresh, threshold, refreshingHeight, disabled]);

  return {
    pullDistance,
    isRefreshing,
    isPulling: isPulling && pullDistance > 0,
  };
}