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

  const marquee = document.querySelector("#testimonial-marquee");
  const track = document.querySelector("#testimonial-track");
  if (marquee && track) {
    for (const card of [...track.children]) {
      track.append(card.cloneNode(true));
    }
    let holdTimer = 0;
    track.addEventListener("touchstart", () => {
      holdTimer = window.setTimeout(() => track.classList.add("is-paused"), 150);
    }, { passive: true });
    track.addEventListener("touchend", () => {
      window.clearTimeout(holdTimer);
      track.classList.remove("is-paused");
    });
    track.addEventListener("touchcancel", () => {
      window.clearTimeout(holdTimer);
      track.classList.remove("is-paused");
    });
  }

  const chatStack = document.querySelector("#chat-demo-stack");
  if (chatStack) {
    const steps = [
      { key: "landing.chat1", cls: "" },
      { key: "landing.chat2", cls: "is-action" },
      { key: "landing.chat3", cls: "is-danger" },
      { key: "landing.chat4", cls: "is-safe" },
    ];
    const MAX_VISIBLE = 3;
    let index = 0;
    let bubbles = [];

    function t(key) {
      return window.AmaninI18n?.t(key) ?? key;
    }

    function updateDim() {
      const visible = bubbles.filter((b) => b.classList.contains("is-visible"));
      visible.forEach((bubble, position) => {
        bubble.classList.toggle("is-dim", visible.length - position > MAX_VISIBLE);
      });
    }

    function revealNext() {
      if (index >= steps.length) {
        window.setTimeout(() => {
          for (const bubble of bubbles) bubble.remove();
          bubbles = [];
          index = 0;
          window.setTimeout(revealNext, 500);
        }, 2200);
        return;
      }
      const step = steps[index];
      const bubble = document.createElement("p");
      bubble.className = `chat-bubble${step.cls ? ` ${step.cls}` : ""}`;
      bubble.dataset.i18n = step.key;
      bubble.textContent = t(step.key);
      chatStack.append(bubble);
      bubbles.push(bubble);
      window.requestAnimationFrame(() => {
        bubble.classList.add("is-visible");
        updateDim();
      });
      index += 1;
      window.setTimeout(revealNext, 1900);
    }

    revealNext();
  }
})();
