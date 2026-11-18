function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
}

export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: getScrollBehavior(),
  });
}

export function scrollToSection(
  id: string,
  block: ScrollLogicalPosition = "start",
) {
  document.getElementById(id)?.scrollIntoView({
    behavior: getScrollBehavior(),
    block,
  });
}