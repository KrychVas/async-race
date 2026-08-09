export const showWinnerModal = (name: string, time: number): void => {
  const existingModal = document.querySelector('.winner-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'winner-modal';
  modal.textContent = `🏆 Winner: ${name} (${time}s)!`;

  // Гарантовані стилі через JS для візуалізації поверх усіх блоків
  Object.assign(modal.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1b2a4a',
    color: '#00ffcc',
    border: '3px solid #00ffcc',
    padding: '24px 40px',
    borderRadius: '16px',
    fontSize: '26px',
    fontWeight: 'bold',
    boxShadow: '0 0 35px rgba(0, 255, 204, 0.6)',
    zIndex: '999999',
    textAlign: 'center',
  });

  document.body.appendChild(modal);

  setTimeout(() => {
    modal.remove();
  }, 5000);
};