import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ArchiveItemProps {
  images: string[];
  title: string;
  date: string;
}

export function ArchiveItem({ date, images, title }: ArchiveItemProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="group relative overflow-hidden rounded-md border border-white/10 bg-zinc-900">
      <div className="aspect-square relative overflow-hidden">
        {images.length === 1 ? (
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {images.map((src, index) => (
                <CarouselItem key={index} className="relative h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src={src}
                      alt={`${title} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-black/50 border-none text-white hover:bg-black/70" />
            <CarouselNext className="right-2 bg-black/50 border-none text-white hover:bg-black/70" />
          </Carousel>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <p className="text-xs text-zinc-400 mt-1 font-mono">{date}</p>
      </div>
    </div>
  );
}
