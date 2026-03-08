document.addEventListener("astro:page-load", () => {
    const galleries = document.querySelectorAll("section[id]");

    galleries.forEach((gallery) => {
        const grid = gallery.querySelector(".grid");
        const toggleBtn = gallery.querySelector(".gallery-toggle-btn");
        const toggleTextSpans = gallery.querySelectorAll(".gallery-toggle-text");
        const toggleIcon = gallery.querySelector(".gallery-toggle-icon");

        if (!grid || !toggleBtn) return;

        const items = Array.from(grid.children);
        if (items.length === 0) return;

        let isExpanded = false;

        // Determine how many items to show initially based on screen size
        const getVisibleCount = () => {
            const width = window.innerWidth;
            if (width < 768) return 2; // Mobile (md breakpoint is 768px): Show 2 max
            if (width < 1024) return 2; // Tablet (lg breakpoint is 1024px): Show 2 max (1 row)
            return 3; // Desktop: Show 3 max (1 row)
        };

        const updateVisibility = (animate = true) => {
            const visibleCount = getVisibleCount();

            // If there are less items than the visible count, hide the button
            if (items.length <= visibleCount) {
                if (toggleBtn) {
                    const wrapper = toggleBtn.closest('.gallery-toggle-wrapper');
                    if (wrapper) wrapper.classList.add('hidden');
                }
                items.forEach(item => {
                    item.classList.remove('hidden');
                    item.style.opacity = "1";
                    item.style.transform = "translateY(0)";
                });
                return;
            } else {
                if (toggleBtn) {
                    const wrapper = toggleBtn.closest('.gallery-toggle-wrapper');
                    if (wrapper) wrapper.classList.remove('hidden');
                }
            }

            // Update visibility of items
            items.forEach((item, index) => {
                // Ensure display none isn't stuck
                item.style.display = "";

                if (isExpanded) {
                    // Show all
                    item.classList.remove('hidden');

                    if (animate) {
                        // Small delay to allow 'hidden' to be removed from DOM
                        setTimeout(() => {
                            item.classList.remove('opacity-0', 'translate-y-4');
                            item.classList.add('opacity-100', 'translate-y-0');
                        }, 50);
                    } else {
                        item.classList.remove('opacity-0', 'translate-y-4');
                        item.classList.add('opacity-100', 'translate-y-0');
                    }
                } else {
                    // Hide items beyond threshold
                    if (index >= visibleCount) {
                        item.classList.remove('opacity-100', 'translate-y-0');
                        item.classList.add('opacity-0', 'translate-y-4');

                        if (animate) {
                            setTimeout(() => {
                                if (!isExpanded) {
                                    item.classList.add('hidden');
                                }
                            }, 300);
                        } else {
                            item.classList.add('hidden');
                        }
                    } else {
                        item.classList.remove('hidden', 'opacity-0', 'translate-y-4');
                        item.classList.add('opacity-100', 'translate-y-0');
                    }
                }
            });

            // Update button text and icon
            if (isExpanded) {
                toggleTextSpans.forEach(span => {
                    const el = span;
                    if (el.dataset.i18n === "gallery.view_more") el.classList.add("hidden");
                    if (el.dataset.i18n === "gallery.view_less") el.classList.remove("hidden");
                });
                if (toggleIcon) toggleIcon.style.transform = "rotate(-180deg)";
            } else {
                toggleTextSpans.forEach(span => {
                    const el = span;
                    if (el.dataset.i18n === "gallery.view_more") el.classList.remove("hidden");
                    if (el.dataset.i18n === "gallery.view_less") el.classList.add("hidden");
                });
                if (toggleIcon) toggleIcon.style.transform = "rotate(0)";
            }
        };

        // Initial setup
        // Add transition to items before we start hiding them
        items.forEach(item => {
            item.classList.add('transition-all', 'duration-300', 'ease-in-out');
        });
        updateVisibility(false);

        // Prevent duplicate listeners on Astro ViewTransitions
        if (!toggleBtn.dataset.initialized) {
            toggleBtn.dataset.initialized = "true";
            toggleBtn.addEventListener("click", () => {
                isExpanded = !isExpanded;
                updateVisibility(true);

                // If we are collapsing, scroll back to top of gallery gently if we are far down
                if (!isExpanded) {
                    const galleryTop = gallery.getBoundingClientRect().top + window.scrollY;
                    if (window.scrollY > galleryTop + 200) {
                        window.scrollTo({ top: galleryTop - 100, behavior: "smooth" });
                    }
                }
            });

            // Auto-expand on index navigation (hash match)
            const checkHashAndExpand = () => {
                if (window.location.hash === '#' + gallery.id && !isExpanded) {
                    isExpanded = true;
                    updateVisibility(true);
                }
            };
            window.addEventListener("hashchange", checkHashAndExpand);
            // Check immediately on load bridging delayed renders
            setTimeout(checkHashAndExpand, 100);

            // Astro ViewTransitions / Link interceptors can swallow hashchange events.
            // Bind click listeners directly to index links pointing to this gallery.
            const indexLinks = document.querySelectorAll(`a[href="#${gallery.id}"]`);
            indexLinks.forEach(link => {
                link.addEventListener("click", () => {
                    if (!isExpanded) {
                        isExpanded = true;
                        updateVisibility(true);
                    }
                });
            });

            // Auto-expand if the user clicks any artwork to view it
            items.forEach(item => {
                item.addEventListener("click", () => {
                    if (!isExpanded) {
                        isExpanded = true;
                        updateVisibility(true);
                    }
                });
            });

            // Auto-collapse when the entire gallery goes completely out of view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting && isExpanded) {
                        isExpanded = false;
                        updateVisibility(false);
                    }
                });
            }, {
                threshold: 0,
                rootMargin: "100px 0px" // give it a 100px buffer before collapsing to avoid jarring jumps
            });
            observer.observe(gallery);

            // Handle window resize dynamically to adjust rows when collapsed
            let resizeTimer;
            window.addEventListener("resize", () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (!isExpanded) {
                        updateVisibility(false);
                    }
                }, 100);
            });

            // --- DEEP LINKING FOR GALLERIES ---
            // Auto expand if URL parameter indicates this gallery should be open
            const urlParams = new URLSearchParams(window.location.search);
            const targetGallery = urlParams.get("gallery");
            if (targetGallery && gallery.id === targetGallery) {
                setTimeout(() => {
                    if (!isExpanded) {
                        isExpanded = true;
                        updateVisibility(true);
                    }
                    gallery.scrollIntoView({ behavior: "instant" });

                    // Clean URL
                    const newUrl = window.location.pathname + window.location.hash;
                    window.history.replaceState({}, document.title, newUrl);
                }, 100);
            }
        }
    });
});
