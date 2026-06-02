"use client";

import { useRef, type CSSProperties } from "react";

interface Props {
  id: string;
  href: string;
  title: string;
  external?: boolean;
}

const wrapperStyle: CSSProperties = {
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
};

const mediaStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transformOrigin: "center center",
  transition: "transform 320ms cubic-bezier(0.4, 0, 0.2, 1)",
};

export function ProjectThumbnail({ id, href, title, external }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const onEnter = () => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  };

  const onLeave = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={href}
      aria-label={`Open ${title} live`}
      className="group/thumb block relative aspect-video mb-4"
      style={wrapperStyle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      {...externalProps}
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster={`/thumbs/${id}.jpg`}
        aria-label={`Live preview of ${title}`}
        className="group-hover/thumb:scale-110 motion-reduce:!scale-100"
        style={mediaStyle}
      >
        <source src={`/thumbs/${id}.mp4`} type="video/mp4" />
      </video>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 opacity-0 group-hover/thumb:opacity-100 transition-opacity"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
      >
        Open live ↗
      </span>
    </a>
  );
}
