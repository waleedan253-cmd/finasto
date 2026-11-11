"use client";

import { useEffect, useRef, useState } from "react";

/** Cloudinary: H.264 MP4, no audio, 1280px wide, light compression. */
const optimise = (url: string) =>
  url.replace("/upload/", "/upload/f_mp4,vc_h264,ac_none,q_auto:eco,w_1280/");

export function BackgroundVideo({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [disabled, setDisabled] = useState(false);
  const [inView, setInView] = useState(false);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  // Video plays for everyone. Only data-saver users skip it (the image stays),
  // since that setting is about bandwidth, not motion.
  useEffect(() => {
    const saveData = (
      navigator as unknown as { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    if (saveData) setDisabled(true);
  }, []);

  // Start loading only when the section is near the viewport.
  useEffect(() => {
    if (disabled || !ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setLoad(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [disabled]);

  // iOS needs muted and playsinline as real attributes, not only React props.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.defaultMuted = true;
    v.muted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
  }, []);

  const tryPlay = () => {
    const v = ref.current;
    if (v && inView && v.paused) v.play().catch(() => {});
  };

  // Play only while visible, pause when scrolled away.
  useEffect(() => {
    const v = ref.current;
    if (!v || !load) return;
    if (inView) tryPlay();
    else v.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, load]);

  // Second chance: if autoplay was blocked (Low Power Mode), the first tap
  // on the page starts the video.
   // Fallback for Low Power Mode: the first real touch starts the video,
  // and the listeners stay until play() actually succeeds.
  useEffect(() => {
    const v = ref.current;
    if (!v || !load) return;

    const events = ["touchend", "pointerdown", "click"] as const;
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, kick));
    const kick = () => {
      if (!inView) return;
      v.play().then(cleanup).catch(() => {});
    };

    if (!v.paused) return;
    events.forEach((e) =>
      window.addEventListener(e, kick, { passive: true }),
    );
    return cleanup;
  }, [load, inView]);

  if (disabled) return null;

  return (
    <video
      ref={ref}
      src={load ? optimise(src) : undefined}
      muted
      loop
      playsInline
      preload={load ? "auto" : "none"}
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
           autoPlay
      onCanPlay={tryPlay}
      onPlaying={() => setReady(true)}
      className={`${className} transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}