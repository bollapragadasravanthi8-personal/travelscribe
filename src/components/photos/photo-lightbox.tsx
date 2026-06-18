"use client";

import dynamic from "next/dynamic";

import "yet-another-react-lightbox/styles.css";

const Lightbox = dynamic(
  () => import("yet-another-react-lightbox").then((mod) => mod.default),
  { ssr: false },
);

type PhotoLightboxItem = {
  url: string;
  caption?: string | null;
  aiCaption?: string | null;
};

type PhotoLightboxProps = {
  photos: PhotoLightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function PhotoLightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: PhotoLightboxProps) {
  const slides = photos.map((photo) => ({
    src: photo.url,
    alt: photo.aiCaption ?? photo.caption ?? "Travel photo",
    title: photo.aiCaption ?? photo.caption ?? undefined,
  }));

  return (
    <Lightbox
      open={index !== null}
      close={onClose}
      index={index ?? 0}
      slides={slides}
      on={{
        view: ({ index: nextIndex }) => onIndexChange(nextIndex),
      }}
    />
  );
}
