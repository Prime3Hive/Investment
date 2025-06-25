import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  circle?: boolean;
  count?: number;
  inline?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  circle = false,
  count = 1,
  inline = false,
}) => {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-700';
  const shapeClasses = circle 
    ? 'rounded-full' 
    : rounded 
      ? 'rounded-md' 
      : '';
  
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || '1rem',
    display: inline ? 'inline-block' : 'block',
  };

  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <span
            key={i}
            className={`${baseClasses} ${shapeClasses} ${className}`}
            style={{
              ...style,
              marginTop: i > 0 ? '0.5rem' : undefined,
            }}
            aria-hidden="true"
          />
        ))}
    </>
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array(lines)
        .fill(0)
        .map((_, i) => (
          <Skeleton 
            key={i} 
            width={i === lines - 1 ? '70%' : '100%'} 
            height="0.8rem" 
            rounded 
          />
        ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 border rounded-lg shadow-sm ${className}`}>
      <Skeleton height="1.5rem" width="60%" rounded className="mb-4" />
      <SkeletonText lines={2} />
      <div className="flex justify-between mt-4">
        <Skeleton width="30%" height="1rem" rounded />
        <Skeleton width="20%" height="1rem" rounded />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({ 
  rows = 5, 
  cols = 4,
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex w-full mb-4">
        {Array(cols)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex-1 px-2">
              <Skeleton height="1.5rem" rounded />
            </div>
          ))}
      </div>
      
      {/* Rows */}
      {Array(rows)
        .fill(0)
        .map((_, rowIndex) => (
          <div key={rowIndex} className="flex w-full mb-3">
            {Array(cols)
              .fill(0)
              .map((_, colIndex) => (
                <div key={colIndex} className="flex-1 px-2">
                  <Skeleton height="1rem" rounded />
                </div>
              ))}
          </div>
        ))}
    </div>
  );
};

export const SkeletonAvatar: React.FC<{ size?: string; className?: string }> = ({ 
  size = '3rem',
  className = '' 
}) => {
  return (
    <Skeleton 
      width={size} 
      height={size} 
      circle 
      className={className} 
    />
  );
};

export const SkeletonButton: React.FC<{ width?: string; className?: string }> = ({ 
  width = '6rem',
  className = '' 
}) => {
  return (
    <Skeleton 
      width={width} 
      height="2.5rem" 
      rounded 
      className={className} 
    />
  );
};

export default Skeleton;
