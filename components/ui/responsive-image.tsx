import { useState } from 'react';
import Image from 'next/image';

export default function ResponsiveImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = "",
  ...props 
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  [key: string]: any;
}) {
  const [isError, setIsError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: `${width}/${height}` }}>
      {!isError ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          onError={() => setIsError(true)}
          className={`object-cover w-full h-full ${className}`}
          {...props}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
          {alt || "Image not available"}
        </div>
      )}
    </div>
  );
}
