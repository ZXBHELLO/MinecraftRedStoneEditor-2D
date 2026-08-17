// Application entry point

function init() {
  loadLanguage('zh_cn');
  loadThemeFromStorage();
  setupEventListeners();
  setupMobileEventListeners();
  setupModalEventListeners();
  setupDayNightToggle();
  setupZoomControls();

  loadDesignFromStorage();
  updateMobileToolbarHeight();
  preloadResources();

  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('load', () => updateMobileToolbarHeight());
}

function setupEventListeners() {
  bindClick('reload-btn', () => location.reload());

  const searchInput = document.getElementById('component-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      e.stopPropagation();
      filterComponents();
    });
  }

  document.addEventListener('contextmenu', (e) => {
    if (e.target.id === 'canvas') {
      e.preventDefault();
    }
  });
}

window.addEventListener('DOMContentLoaded', init);
