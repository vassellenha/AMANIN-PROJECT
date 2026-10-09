"use strict";

const filters = [...document.querySelectorAll(".news-filter")];
const articles = [...document.querySelectorAll(".news-article")];
const emptyState = document.querySelector("#news-empty");

for (const filter of filters) {
  filter.addEventListener("click", () => {
    const category = filter.dataset.filter;
    let visibleCount = 0;

    for (const article of articles) {
      const visible = category === "all" || article.dataset.category === category;
      article.classList.toggle("is-hidden", !visible);
      if (visible) visibleCount += 1;
    }

    for (const option of filters) {
      const selected = option === filter;
      option.classList.toggle("is-active", selected);
      option.setAttribute("aria-pressed", String(selected));
    }

    emptyState.classList.toggle("is-hidden", visibleCount > 0);
  });
}
