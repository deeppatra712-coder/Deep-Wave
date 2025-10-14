// Scroll fade-in animation for plan cards
const cards = document.querySelectorAll('.plan-card');

window.addEventListener('scroll', () => {
  const trigger = window.innerHeight * 0.8;
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.top < trigger) {
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
      card.style.transition = "0.8s ease";
    }
  });
});