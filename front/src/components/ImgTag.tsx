"use client";
import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";
import React, { useState } from "react";
const ImageError = "/error-image.webp";
type ImageType = {
  src: any;
  alt: string | null;
  className?: string;
  width?: number;
  height?: number;
  classPlus?: string;
  figureClass?: string;
  customSrc?: string
  onClick?: (value: any) => void
  priority?: boolean
  loading?: 'lazy' | 'eager'
};
export default function ImgTag({
  width,
  height,
  src,
  alt,
  className,
  classPlus,
  figureClass,
  customSrc,
  onClick,
  loading,
  priority = false
}: ImageType) {
  const [load, setLoad] = useState<boolean>(true);
  const [error, setError] = useState<string | StaticImageData | null>(null)
  const classImage = cn(className || "rounded-md shadow-md w-full h-auto table mx-auto object-fill", classPlus)
  const url = customSrc || process.env.NEXT_PUBLIC_MEDIA_DOMAIN + src
  return (
    <figure className={figureClass || "w-full relative"}>
      {src ?
        <Image
          width={width || 1080}
          height={height || 1080}
          loading={loading || 'lazy'}
          onClick={onClick}
          priority={priority}
          // placeholder="blur"
          // blurDataURL="data:image/gif;base64,..."
          onLoad={() => setLoad(false)}
          src={error ? error : url || ImageError}
          alt={alt || "error"}
          className={classImage}
          onError={() => setError(ImageError)}
        />
        :
        <Image
          width={width || 1080}
          height={height || 1080}
          loading="lazy"
          onClick={onClick}
          // placeholder="blur"
          // blurDataURL="data:image/gif;base64,..."
          src={ImageError}
          alt={"error"}
          className={classImage}
        />
      }

      {/* {load && <LoadingImg />} */}
    </figure>
  );
}
