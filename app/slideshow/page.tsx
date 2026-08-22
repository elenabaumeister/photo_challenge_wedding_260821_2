"use client";

import { useEffect, useRef, useState } from "react";

type Slide = { id: string; image_url: string; guest_name: string | null; challenge: { task: string } };

export default function Slideshow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideshowRef = useRef<HTMLElement>(null);

  async function refresh() {
    const r = await fetch("/api/slideshow", { cache: "no-store" });
    if (r.ok) {
      const next = await r.json();
      setSlides(next);
      setIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
    }
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isPlaying || !slides.length) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      return;
    }

    const timer = setTimeout(() => setControlsVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [controlsVisible, isPlaying]);

  useEffect(() => {
    function updateFullscreenState() {
      setIsFullscreen(document.fullscreenElement === slideshowRef.current);
    }

    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () => document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  function previousSlide() {
    setIndex((currentIndex) => (currentIndex - 1 + slides.length) % slides.length);
  }

  function nextSlide() {
    setIndex((currentIndex) => (currentIndex + 1) % slides.length);
  }

  function showControls() {
    setControlsVisible(true);
  }

  async function toggleFullscreen() {
    if (!slideshowRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await slideshowRef.current.requestFullscreen();
    }
  }

  const slide = slides[index];

  return (
    <main ref={slideshowRef} className="slideshow" onMouseMove={showControls} onTouchStart={showControls}>
      {slide ? (
        <>
          <div className="slide-backdrop" style={{ backgroundImage: `url(${slide.image_url})` }} />
          <img src={slide.image_url} className="slide-image" alt={slide.challenge.task} />
          <div className="slide-caption">
            <div className="eyebrow">PHOTO CHALLENGE</div>
            <h1>{slide.challenge.task}</h1>
            {slide.guest_name && <p>📷 {slide.guest_name}</p>}
          </div>
          <div className="slide-count">{index + 1} / {slides.length}</div>
          <div className={`slideshow-controls${controlsVisible ? "" : " hidden"}`} aria-label="Slideshow controls">
            <button className="slideshow-control" type="button" onClick={previousSlide} disabled={slides.length < 2} aria-label="Previous photo">
              Previous
            </button>
            <button className="slideshow-control" type="button" onClick={() => setIsPlaying((playing) => !playing)} aria-pressed={isPlaying}>
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button className="slideshow-control" type="button" onClick={nextSlide} disabled={slides.length < 2} aria-label="Next photo">
              Next
            </button>
            <button className="slideshow-control" type="button" onClick={toggleFullscreen}>
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </button>
          </div>
        </>
      ) : (
        <div className="empty-slideshow">
          <div className="big-emoji">📸</div>
          <h1>The slideshow is ready.</h1>
          <p>Photos will appear here as guests submit them.</p>
        </div>
      )}
    </main>
  );
}