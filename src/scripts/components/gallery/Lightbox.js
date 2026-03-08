document.addEventListener("astro:page-load", () => {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  let lightboxClose = document.getElementById("lightbox-close");
  let lightboxPrev = document.getElementById("lightbox-prev");
  let lightboxNext = document.getElementById("lightbox-next");
  const allItemsList = document.querySelectorAll(
    ".group.relative.aspect-square",
  );

  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxYear = document.getElementById("lightbox-year");
  const lightboxDesc = document.getElementById("lightbox-desc");
  const lightboxInfo = document.getElementById("lightbox-info");
  const lightboxRecognitionsContainer = document.getElementById("lightbox-recognitions-container");
  const lightboxRecognitionsList = document.getElementById("lightbox-recognitions-list");

  let activeGroupItems = [];
  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  if (lightbox && lightboxImg && lightboxClose) {
    let isZoomed = false;
    let translateX = 0;
    let translateY = 0;
    let maxTranslateX = 0;
    let maxTranslateY = 0;
    let panX = 0;
    let panY = 0;
    let panRAF = null;
    let isDraggingPan = false;

    function resetZoom() {
      if (!isZoomed) return;
      isZoomed = false;
      panX = 0;
      panY = 0;
      translateX = 0;
      translateY = 0;
      if (panRAF) {
        cancelAnimationFrame(panRAF);
        panRAF = null;
      }
      lightboxImg.style.transition = "transform 0.3s ease-out";
      lightboxImg.style.transform = "translate(0px, 0px) scale(1)";
      lightboxImg.style.cursor = "zoom-in";

      if (lightboxPrev) {
        lightboxPrev.classList.remove("hidden");
        setTimeout(() => lightboxPrev.classList.remove("opacity-0"), 50);
      }
      if (lightboxNext) {
        lightboxNext.classList.remove("hidden");
        setTimeout(() => lightboxNext.classList.remove("opacity-0"), 50);
      }

      updateArrowVisibility();
    }

    function panLoop() {
      if (!isZoomed || (panX === 0 && panY === 0)) {
        panRAF = null;
        return;
      }

      let speedX = window.innerWidth / 100;
      let speedY = window.innerHeight / 100;

      translateX += -panX * speedX;
      translateY += -panY * speedY;

      translateX = Math.max(
        -maxTranslateX,
        Math.min(maxTranslateX, translateX),
      );
      translateY = Math.max(
        -maxTranslateY,
        Math.min(maxTranslateY, translateY),
      );

      lightboxImg.style.transition = "transform 0.3s ease-out";
      lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(2.5)`;
      panRAF = requestAnimationFrame(panLoop);
    }

    function toggleZoom(e) {
      if (isDraggingPan) {
        setTimeout(() => (isDraggingPan = false), 50);
        return;
      }
      if (!isZoomed) {
        const rect = lightboxImg.getBoundingClientRect();
        let cx = e.clientX;
        let cy = e.clientY;
        if (
          cx === undefined &&
          e.changedTouches &&
          e.changedTouches.length > 0
        ) {
          cx = e.changedTouches[0].clientX;
          cy = e.changedTouches[0].clientY;
        }

        const imgRatio = lightboxImg.naturalWidth / lightboxImg.naturalHeight;
        const containerRatio = rect.width / rect.height;

        let trueWidth, trueHeight;

        if (imgRatio > containerRatio) {
          trueWidth = rect.width;
          trueHeight = rect.width / imgRatio;
        } else {
          trueHeight = rect.height;
          trueWidth = rect.height * imgRatio;
        }

        let zoomedWidth = trueWidth * 2.5;
        let zoomedHeight = trueHeight * 2.5;

        maxTranslateX = Math.max(0, (zoomedWidth - rect.width) / 2);
        maxTranslateY = Math.max(0, (zoomedHeight - rect.height) / 2);

        let containerCx = rect.left + rect.width / 2;
        let containerCy = rect.top + rect.height / 2;

        let percentX = (containerCx - cx) / (rect.width / 2);
        let percentY = (containerCy - cy) / (rect.height / 2);

        translateX = percentX * maxTranslateX;
        translateY = percentY * maxTranslateY;

        translateX = Math.max(
          -maxTranslateX,
          Math.min(maxTranslateX, translateX),
        );
        translateY = Math.max(
          -maxTranslateY,
          Math.min(maxTranslateY, translateY),
        );

        lightboxImg.style.transition = "transform 0.3s ease-out";
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(2.5)`;
        lightboxImg.style.cursor = "zoom-out";
        isZoomed = true;

        if (lightboxPrev) lightboxPrev.classList.add("hidden");
        if (lightboxNext) lightboxNext.classList.add("hidden");
      } else {
        resetZoom();
      }
    }

    window.addEventListener("mousemove", (e) => {
      if (!isZoomed || isDraggingPan) {
        panX = 0;
        panY = 0;
        return;
      }
      const edgeX = window.innerWidth * 0.15;
      const edgeY = window.innerHeight * 0.15;
      panX = 0;
      panY = 0;
      if (e.clientX < edgeX) panX = -1 + e.clientX / edgeX;
      else if (e.clientX > window.innerWidth - edgeX)
        panX = (e.clientX - (window.innerWidth - edgeX)) / edgeX;
      if (e.clientY < edgeY) panY = -1 + e.clientY / edgeY;
      else if (e.clientY > window.innerHeight - edgeY)
        panY = (e.clientY - (window.innerHeight - edgeY)) / edgeY;
      if ((panX !== 0 || panY !== 0) && !panRAF) panLoop();
    });

    function updateArrowVisibility() {
      if (!lightboxPrev || !lightboxNext) return;

      if (currentIndex <= 0) {
        lightboxPrev.classList.add("opacity-10", "pointer-events-none");
      } else {
        lightboxPrev.classList.remove("opacity-10", "pointer-events-none");
      }

      if (currentIndex >= activeGroupItems.length - 1) {
        lightboxNext.classList.add("opacity-10", "pointer-events-none");
      } else {
        lightboxNext.classList.remove("opacity-10", "pointer-events-none");
      }
    }

    function updateLightbox(index) {
      if (activeGroupItems.length === 0) return;

      if (index < 0 || index >= activeGroupItems.length) return;

      resetZoom();
      currentIndex = index;
      const currentItem = activeGroupItems[currentIndex];
      const img = currentItem.querySelector("img");

      if (img) {
        lightboxImg.classList.remove("opacity-100");
        lightboxImg.classList.add("opacity-30");
        if (lightboxInfo) {
          lightboxInfo.classList.remove("opacity-100");
          lightboxInfo.classList.add("opacity-0");
        }

        setTimeout(() => {
          lightboxImg.src = img.src;

          if (lightboxTitle)
            lightboxTitle.textContent =
              currentItem.dataset.title || "Obra sin título";
          if (lightboxYear)
            lightboxYear.textContent = currentItem.dataset.year || "----";
          if (lightboxDesc)
            lightboxDesc.textContent = currentItem.dataset.description || "";

          // Populate Recognitions
          if (lightboxRecognitionsContainer && lightboxRecognitionsList) {
            try {
              const recogsRaw = currentItem.dataset.recognitions;
              if (recogsRaw) {
                const recogs = JSON.parse(recogsRaw);
                if (Array.isArray(recogs) && recogs.length > 0) {
                  let html = "";
                  recogs.forEach(r => {
                    let icon = "star";
                    if (r.type === "award") icon = "emoji_events";
                    else if (r.type === "exhibition") icon = "museum";

                    html += `
                      <li class="flex items-start gap-3">
                        <div class="relative inline-flex items-center justify-center shrink-0 mt-[1px]">
                          <span class="material-symbols-outlined text-[20px] text-accent-pink" style="font-variation-settings: 'FILL' 1">${icon}</span>
                          ${r.badge ? `<span class="absolute text-[9px] font-bold text-white bg-accent-pink rounded-full w-3 h-3 flex items-center justify-center leading-none ${r.type === 'award' ? 'mb-[5px] ml-[1px]' : 'mt-[2px]'}">${r.badge}</span>` : ''}
                        </div>
                        <span class="leading-snug mt-[1px]">${r.text}</span>
                      </li>
                    `;
                  });
                  lightboxRecognitionsList.innerHTML = html;
                  lightboxRecognitionsContainer.classList.remove("hidden");
                } else {
                  lightboxRecognitionsContainer.classList.add("hidden");
                }
              } else {
                lightboxRecognitionsContainer.classList.add("hidden");
              }
            } catch (e) {
              lightboxRecognitionsContainer.classList.add("hidden");
            }
          }

          lightboxImg.classList.remove("opacity-30");
          lightboxImg.classList.add("opacity-100");
          if (lightboxInfo) {
            lightboxInfo.classList.remove("opacity-0");
            lightboxInfo.classList.add("opacity-100");
          }
          updateArrowVisibility();
        }, 250);
      }
    }

    allItemsList.forEach((item) => {
      if (item.dataset.lightboxInit) return;
      item.dataset.lightboxInit = "true";

      item.addEventListener("click", () => {
        const container = item.closest("section");
        const groupItemsList = container
          ? container.querySelectorAll(".group.relative.aspect-square")
          : [item];
        activeGroupItems = Array.from(groupItemsList);
        currentIndex = activeGroupItems.indexOf(item);

        resetZoom();
        const img = item.querySelector("img");
        if (img) {
          lightboxImg.src = img.src;
          if (lightboxTitle)
            lightboxTitle.textContent =
              item.dataset.title || "Obra sin título";
          if (lightboxYear)
            lightboxYear.textContent = item.dataset.year || "----";
          if (lightboxDesc)
            lightboxDesc.textContent = item.dataset.description || "";

          // Populate Recognitions
          if (lightboxRecognitionsContainer && lightboxRecognitionsList) {
            try {
              const recogsRaw = item.dataset.recognitions;
              if (recogsRaw) {
                const recogs = JSON.parse(recogsRaw);
                if (Array.isArray(recogs) && recogs.length > 0) {
                  let html = "";
                  recogs.forEach(r => {
                    let icon = "star";
                    if (r.type === "award") icon = "emoji_events";
                    else if (r.type === "exhibition") icon = "museum";

                    html += `
                      <li class="flex items-start gap-3 relative top-[4px]">
                        <div class="relative inline-flex items-center justify-center shrink-0 mt-[1px]">
                          <span class="material-symbols-outlined text-[20px] text-accent-pink" style="font-variation-settings: 'FILL' 1">${icon}</span>
                          ${r.badge ? `<span class="absolute text-[9px] font-bold text-white bg-accent-pink rounded-full w-3 h-3 flex items-center justify-center leading-none ${r.type === 'award' ? 'mb-[5px] ml-[1px]' : 'mt-[2px]'}">${r.badge}</span>` : ''}
                        </div>
                        <span class="leading-snug mt-[1px]">${r.text}</span>
                      </li>
                    `;
                  });
                  lightboxRecognitionsList.innerHTML = html;
                  lightboxRecognitionsContainer.classList.remove("hidden");
                } else {
                  lightboxRecognitionsContainer.classList.add("hidden");
                }
              } else {
                lightboxRecognitionsContainer.classList.add("hidden");
              }
            } catch (e) {
              console.error("Error parsing recognitions", e);
              lightboxRecognitionsContainer.classList.add("hidden");
            }
          }

          lightboxImg.style.cursor = "zoom-in";
        }

        lightbox.classList.remove("hidden");
        lightbox.classList.add("flex");
        document.body.style.overflow = "hidden";

        if (activeGroupItems.length > 1) {
          updateArrowVisibility();
          if (lightboxPrev) {
            lightboxPrev.classList.remove("hidden");
            setTimeout(() => lightboxPrev.classList.remove("opacity-0"), 50);
          }
          if (lightboxNext) {
            lightboxNext.classList.remove("hidden");
            setTimeout(() => lightboxNext.classList.remove("opacity-0"), 50);
          }
        }

        setTimeout(() => {
          lightboxImg.classList.remove("opacity-30");
          lightboxImg.classList.add("opacity-100");
          if (lightboxInfo) {
            lightboxInfo.classList.remove("opacity-0");
            lightboxInfo.classList.add("opacity-100");
          }
        }, 50);
      });
    });

    function closeLightbox() {
      resetZoom();
      if (lightboxInfo) {
        lightboxInfo.classList.remove("opacity-100");
        lightboxInfo.classList.add("opacity-0");
      }

      if (lightboxPrev) {
        lightboxPrev.classList.add("opacity-0");
        setTimeout(() => lightboxPrev.classList.add("hidden"), 300);
      }
      if (lightboxNext) {
        lightboxNext.classList.add("opacity-0");
        setTimeout(() => lightboxNext.classList.add("hidden"), 300);
      }

      setTimeout(() => {
        lightbox.classList.add("hidden");
        lightbox.classList.remove("flex");
        lightboxImg.src = "";
        document.body.style.overflow = "";
      }, 300);
    }

    const newLightboxClose = lightboxClose.cloneNode(true);
    lightboxClose.parentNode.replaceChild(newLightboxClose, lightboxClose);
    newLightboxClose.addEventListener("click", closeLightbox);
    lightboxClose = newLightboxClose;

    lightboxImg.addEventListener("click", toggleZoom);

    function showNext() {
      updateLightbox(currentIndex + 1);
    }
    function showPrev() {
      updateLightbox(currentIndex - 1);
    }

    if (lightboxPrev) {
      const newPrev = lightboxPrev.cloneNode(true);
      lightboxPrev.parentNode.replaceChild(newPrev, lightboxPrev);
      newPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        showPrev();
      });
      lightboxPrev = newPrev;
    }
    if (lightboxNext) {
      const newNext = lightboxNext.cloneNode(true);
      lightboxNext.parentNode.replaceChild(newNext, lightboxNext);
      newNext.addEventListener("click", (e) => {
        e.stopPropagation();
        showNext();
      });
      lightboxNext = newNext;
    }

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.parentElement === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("hidden")) {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") showNext();
        if (e.key === "ArrowLeft") showPrev();
      }
    });

    let lastTouchX = 0;
    let lastTouchY = 0;
    let totalDragDistance = 0;

    lightbox.addEventListener(
      "touchstart",
      (e) => {
        if (!isZoomed) {
          touchStartX = e.changedTouches[0].screenX;
        } else if (e.touches.length === 1) {
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
          isDraggingPan = false;
          totalDragDistance = 0;
          panX = 0;
          panY = 0;
        }
      },
      { passive: true },
    );

    lightbox.addEventListener(
      "touchmove",
      (e) => {
        if (!isZoomed || e.touches.length !== 1) return;
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - lastTouchX;
        const deltaY = touchY - lastTouchY;

        totalDragDistance += Math.hypot(deltaX, deltaY);
        if (totalDragDistance > 10) isDraggingPan = true;

        const speed = 1.0;
        translateX += deltaX * speed;
        translateY += deltaY * speed;

        translateX = Math.max(
          -maxTranslateX,
          Math.min(maxTranslateX, translateX),
        );
        translateY = Math.max(
          -maxTranslateY,
          Math.min(maxTranslateY, translateY),
        );

        lightboxImg.style.transition = "transform 0.1s ease-out";
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(2.5)`;
        lastTouchX = touchX;
        lastTouchY = touchY;
      },
      { passive: false },
    );

    lightbox.addEventListener(
      "touchend",
      (e) => {
        if (!isZoomed) {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        }
      },
      { passive: true },
    );

    function handleSwipe() {
      if (isZoomed) return;
      const swipeThreshold = 50;
      const diff = touchEndX - touchStartX;
      if (diff < -swipeThreshold) {
        showNext();
      } else if (diff > swipeThreshold) {
        showPrev();
      }
    }

    // --- INICIO CÓDIGO DE ENLACES PROFUNDOS (DEEP LINKING) ---
    // Buscar si hay un parámetro en la URL del estilo: ?artwork=NombreDeLaObra
    const urlParams = new URLSearchParams(window.location.search);
    const artworkToOpen = urlParams.get("artwork");

    if (artworkToOpen) {
      // Normalizar la cadena para evitar problemas con mayúsculas/minúsculas y espacios
      const normalizeStr = (str) =>
        (str || "").toLowerCase().trim().replace(/[\s-]/g, '');

      const targetName = normalizeStr(artworkToOpen);

      // Usar un ligero timeout para dar tiempo a que las imágenes y Layout se rendericen
      setTimeout(() => {
        // Encontrar la obra correspondiente en todos los elementos iterables
        const targetItem = Array.from(allItemsList).find((item) => {
          const itemTitle = item.dataset.title;
          return normalizeStr(itemTitle) === targetName;
        });

        if (targetItem) {
          // Si el elemento está en una sección, deslizarla a la vista por contexto
          const sectionGroup = targetItem.closest("section");
          if (sectionGroup) {
            sectionGroup.scrollIntoView({ behavior: "instant" });
          }

          // Simular que el usuario ha hecho click en la obra para abrir el lightbox
          targetItem.click();

          // Limpiar el parámetro ?artwork de la URL para que no interfiera si el usuario navega a otra parte y vuelve
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
        }
      }, 300); // 300ms de retraso es seguro para asegurar que las transiciones de vista de Astro completan
    }
  }
});
