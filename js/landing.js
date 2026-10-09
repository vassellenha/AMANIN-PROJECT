(() => {
  const header = document.querySelector(".landing-header");
  if (!header) return;

  let lastScrollY = window.scrollY;
  let scrollFrame = 0;
  let scrollDirection = 0;
  let directionDistance = 0;

  const updateHeader = () => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    header.classList.toggle("is-glass", currentScrollY > 12);

    if (currentScrollY <= 12) {
      header.classList.remove("is-brand-compact");
      directionDistance = 0;
    } else if (scrollDelta) {
      const nextDirection = Math.sign(scrollDelta);
      directionDistance = nextDirection === scrollDirection
        ? directionDistance + scrollDelta
        : scrollDelta;
      scrollDirection = nextDirection;

      if (directionDistance >= 8) header.classList.add("is-brand-compact");
      if (directionDistance <= -8) header.classList.remove("is-brand-compact");
    }

    lastScrollY = currentScrollY;
    scrollFrame = 0;
  };

  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateHeader);
  }, { passive: true });

  updateHeader();
})();
