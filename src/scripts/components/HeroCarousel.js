function setupCarousel() {
  const containers = document.querySelectorAll(".hero-container");

  containers.forEach((container) => {
    const slides = container.querySelectorAll(".hero-slide");
    const indicators = container.querySelectorAll(".slide-indicator");
    if (!slides.length) return;

    let currentSlide = 0;
    let slideIntervalId;

    const goToSlide = (index) => {
      // Hide current slide
      slides[currentSlide].classList.remove("opacity-100", "z-10");
      slides[currentSlide].classList.add("opacity-0", "z-0");
      indicators[currentSlide].classList.remove("bg-white", "w-8");
      indicators[currentSlide].classList.add("bg-white/50");

      // Update index
      currentSlide = index;

      // Show new slide
      slides[currentSlide].classList.remove("opacity-0", "z-0");
      slides[currentSlide].classList.add("opacity-100", "z-10");
      indicators[currentSlide].classList.remove("bg-white/50");
      indicators[currentSlide].classList.add("bg-white", "w-8");
    };

    const nextSlide = () => {
      goToSlide((currentSlide + 1) % slides.length);
    };

    const prevSlide = () => {
      goToSlide((currentSlide - 1 + slides.length) % slides.length);
    };

    const startInterval = () => {
      slideIntervalId = window.setInterval(nextSlide, 5000);
    };

    const resetInterval = () => {
      clearInterval(slideIntervalId);
      startInterval();
    };

    // Touch events for swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );

    container.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true },
    );

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe Left -> Next
          nextSlide();
        } else {
          // Swipe Right -> Prev
          prevSlide();
        }
        resetInterval();
      }
    };

    // Add click events to indicators
    indicators.forEach((indicator) => {
      indicator.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const index = parseInt(target.getAttribute("data-index") || "0");
        if (index !== currentSlide) {
          goToSlide(index);
          resetInterval();
        }
      });
    });

    // Start auto-play
    startInterval();

    // cleanup function hook for astro view transitions
    document.addEventListener(
      "astro:before-swap",
      () => {
        clearInterval(slideIntervalId);
      },
      { once: true },
    );
  });
}

// Run setup when the DOM is ready and on view transitions
document.addEventListener("astro:page-load", setupCarousel);
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  setupCarousel();
} else {
  document.addEventListener("DOMContentLoaded", setupCarousel);
}
