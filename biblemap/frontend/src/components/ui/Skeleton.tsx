import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[size:200%_100%]',
    none: ''
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const defaultSizes = {
    text: { width: '100%', height: '1rem' },
    circular: { width: '40px', height: '40px' },
    rectangular: { width: '100%', height: '100px' },
    rounded: { width: '100%', height: '100px' }
  };

  const finalWidth = width || defaultSizes[variant].width;
  const finalHeight = height || defaultSizes[variant].height;

  return (
    <div
      className={`${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${className}`}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight
      }}
      {...props}
    />
  );
}

// 카드 스켈레톤
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="40%" height={14} />
          <div className="pt-2 space-y-1">
            <Skeleton variant="text" width="100%" height={14} />
            <Skeleton variant="text" width="85%" height={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

// 리스트 스켈레톤
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

// 테이블 스켈레톤
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3">
                <Skeleton variant="text" width="80%" height={16} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton variant="text" width="90%" height={14} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 상세 페이지 스켈레톤
export function DetailPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start space-x-6">
          <Skeleton variant="rounded" width={120} height={120} />
          <div className="flex-1 space-y-3">
            <Skeleton variant="text" width="60%" height={32} />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton variant="text" width="80%" height={16} />
              <Skeleton variant="text" width="80%" height={16} />
              <Skeleton variant="text" width="80%" height={16} />
              <Skeleton variant="text" width="80%" height={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Content sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="bg-white rounded-lg shadow-md p-6">
          <Skeleton variant="text" width={200} height={24} className="mb-3" />
          <div className="space-y-2">
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="95%" height={16} />
            <Skeleton variant="text" width="90%" height={16} />
          </div>
        </div>
      ))}
    </div>
  );
}

// 지도 로딩 스켈레톤
export function MapSkeleton() {
  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-100">
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
        className="absolute inset-0"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">지도 로딩 중...</p>
        </div>
      </div>
    </div>
  );
}