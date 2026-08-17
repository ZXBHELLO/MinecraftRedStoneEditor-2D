/**
 * 应用入口模块：初始化所有子模块、绑定全局事件。
 *
 * 启动流程（DOMContentLoaded）：
 * 1. 加载语言（lang.js）与主题偏好
 * 2. 绑定各模块事件（搜索、弹窗、主题、缩放、移动端）
 * 3. 从 localStorage 恢复上次设计
 * 4. 测量移动端工具栏高度（CSS 变量）
 * 5. 预加载组件图片（utils.preloadResources），完成后初始化组件面板与画布
 *
 * 依赖：lang.js / utils.js / components.js / placements.js / canvas.js / events.js / modals.js
 */

/** 应用初始化入口 */
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

  // 页面关闭前自动存档并提示未保存改动
  window.addEventListener('beforeunload', handleBeforeUnload);
  // 字体渲染完成后再次测量工具栏高度，确保边距精确
  window.addEventListener('load', () => updateMobileToolbarHeight());
}

/** 绑定全局静态事件：资源错误重载、组件搜索、画布右键菜单拦截 */
function setupEventListeners() {
  bindClick('reload-btn', () => location.reload());

  const searchInput = document.getElementById('component-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      e.stopPropagation();
      filterComponents();
    });
  }

  // 阻止画布上的系统右键菜单（右键用于拖动画布）
  document.addEventListener('contextmenu', (e) => {
    if (e.target.id === 'canvas') {
      e.preventDefault();
    }
  });
}

window.addEventListener('DOMContentLoaded', init);
