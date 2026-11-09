(() => {
  const dialog = document.getElementById('community-video-dialog');
  const player = document.getElementById('community-dialog-player');
  const title = document.getElementById('community-dialog-title');
  const error = dialog.querySelector('.community-dialog-error');
  let trigger;

  document.querySelectorAll('.community-video-trigger').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      title.textContent = button.dataset.title;
      error.hidden = true;
      player.src = button.dataset.video;
      dialog.showModal();
      document.body.classList.add('community-dialog-open');
    });
  });
  dialog.querySelector('.community-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.src = 'about:blank';
    document.body.classList.remove('community-dialog-open');
    trigger?.focus();
  });
  player.addEventListener('error', () => { error.hidden = false; });
})();
