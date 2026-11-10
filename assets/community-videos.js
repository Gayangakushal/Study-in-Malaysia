(() => {
  const dialog = document.getElementById('community-video-dialog');
  const player = document.getElementById('community-dialog-player');
  const title = document.getElementById('community-dialog-title');
  if (!dialog || !player || !title) return;
  const error = dialog.querySelector('.community-dialog-error');
  const external = dialog.querySelector('.community-video-external');
  let trigger;
  function close() {
    if (typeof dialog.close === 'function') dialog.close();
    else { dialog.removeAttribute('open'); cleanup(); }
  }
  function cleanup() {
    player.removeAttribute('src');
    document.body.classList.remove('community-dialog-open');
    trigger?.focus();
  }
  document.querySelectorAll('.community-video-trigger').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      title.textContent = button.dataset.title;
      player.title = button.dataset.title + ' video';
      error.hidden = true;
      external.href = button.dataset.video.replace(/\/preview(?:\?.*)?$/, '/view');
      // Open before loading the embedded player so mobile browsers lay it out visibly.
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      document.body.classList.add('community-dialog-open');
      player.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
      player.src = button.dataset.video;
    });
  });
  dialog.querySelector('.community-dialog-close').addEventListener('click', close);
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape' && typeof dialog.close !== 'function') close();
  });
  dialog.addEventListener('close', cleanup);
  player.addEventListener('error', () => { error.hidden = false; });
})();
