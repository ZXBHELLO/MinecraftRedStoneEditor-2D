/**
 * 语言 / 国际化模块
 *
 * 职责：
 * - 内置完整的 zh_cn / en_us 词条数据（languageDataStore），避免在 file:// 协议下
 *   fetch 失败导致界面无法翻译的问题。两种语言均内置，无需外部文件。
 * - 界面静态文本通过 data-lang 属性自动应用；状态栏等动态文本使用
 *   data-lang-dynamic + {n} 占位符模板，由 updateDynamicText() 填充实际数值。
 * - 按钮悬停提示（title）通过 data-lang-title 属性翻译。
 *
 * 依赖：
 * - 无外部依赖；但 updateStatusBar()（定义于 utils.js）会在语言切换时被调用，
 *   因此本文件必须先于 utils.js 加载（见 index.html 的 script 顺序）。
 */

/** 内置词条数据：zh_cn 为默认中文，en_us 为英文 */
const languageDataStore = {
  zh_cn: {
    'loader_text': '正在加载红石组件资源...',
    'resource_error_title': '资源加载错误',
    'resource_error_message': '无法加载红石组件资源。请确保您的本地文件结构包含一个名为 assets 的文件夹，其中包含所有必要的红石组件图片。',
    'resource_error_structure': '文件结构应如下所示：',
    'resource_error_hint': '如果您还没有这些资源，请下载完整的资源包并解压到项目目录中。',
    'reload_btn': '重新加载',
    'header_title': 'RedStone Editor',
    'theme_btn': '主题',
    'theme_light': '日间模式',
    'theme_dark': '夜间模式',
    'clear_btn': '清空',
    'save_btn': '导出',
    'load_btn': '导入',
    'undo_btn': '撤销',
    'redo_btn': '重做',
    'components_panel_title': '组件库',
    'category_basic': '基础方块',
    'category_mechanical': '机械元件',
    'category_decorative': '装饰方块',
    'category_special': '特殊方块',
    'search_placeholder': '搜索组件（中文/拼音/英文）',
    'block_count': '已放置: {0} 个组件',
    'current_component': '当前: {0}',
    'cursor_position': '坐标: {0}, {1}',
    'canvas_scale': '缩放: {0}%',
    'theme_display': '模式: {0}',
    'screenshot_modal_title': '截图预览',
    'close_btn': '关闭',
    'download_screenshot_btn': '下载PNG',
    'save_modal_title': '保存设计',
    'design_name_label': '设计名称',
    'design_name_placeholder': '输入设计名称',
    'design_description_label': '描述 (可选)',
    'design_description_placeholder': '输入设计描述',
    'cancel_btn': '取消',
    'confirm_save_btn': '保存设计',
    'load_modal_title': '导入设计',
    'file_drop_text': '拖放设计文件到这里',
    'file_drop_hint': '或点击选择文件',
    'load_status': '请选择或拖放JSON设计文件',
    'confirm_load_btn': '导入设计',
    'clear_confirm_modal_title': '清空画布',
    'clear_confirm_message': '确定要清空整个画布吗？',
    'clear_confirm_warning': '此操作将永久移除所有已放置的组件且无法撤销。',
    'confirm_clear_btn': '确认清空',
    'help_modal_title': '使用帮助',
    'basic_operations_title': '基本操作',
    'basic_operation_1': '从左侧面板选择组件',
    'basic_operation_2': '在画布上点击放置组件',
    'basic_operation_3': '使用与格子上相同的组件再次点击，可删除该格组件（负负得正）',
    'basic_operation_4': '使用鼠标中键拖拽移动画布',
    'basic_operation_5': '使用滚轮缩放画布',
    'keyboard_shortcuts_title': '键盘快捷键',
    'shortcut_undo': '撤销',
    'shortcut_redo': '重做',
    'touch_operations_title': '触屏操作',
    'touch_operation_1': '长按已放置的组件可将其删除',
    'touch_operation_2': '双击画布放大/缩小视图',
    'touch_operation_3': '双指捏合缩放画布',
    'search_function_title': '搜索功能',
    'search_function_1': '支持中文名称搜索（如"红石"）',
    'search_function_2': '支持拼音搜索（如"hongshi"）',
    'search_function_3': '支持拼音首字母搜索（如"hs"）',
    'search_function_4': '支持英文名称搜索（如"redstone"）',
    'zoom_controls_title': '缩放控制',
    'zoom_control_1': '放大视图',
    'zoom_control_2': '缩小视图',
    'zoom_control_3': '重置缩放',
    'project_info_title': '项目信息',
    'project_info_version': '项目版本：1.5',
    'project_info_bilibili': 'BILIBILI：ZXBHELLO',
    'project_info_email': 'E-MAIL：ZXBHELLO@GMAIL.COM',
    'project_info_github': 'GITHUB：MinecraftRedStoneEditor',
    'project_info_feedback': '遇到错误？缺少组件？提供想法？请前往：项目提议',
    'error_display_title': '错误日志',
    'invalid_design_format': '无效的设计文件格式',
    'load_error': '导入失败',
    'file_read_error': '读取文件时出错',
    'load_success': '设计导入成功',
    'select_file_prompt': '请选择设计文件',
    'selected_file': '已选择文件',
    'unsaved_changes_warning': '您有未保存的更改，确定要离开吗？',
    'untitled_design': '未命名设计',
    'design_file_suffix': '红石设计',
    'resource_load_failed': '资源加载失败',
    'error': '错误'
  },
  en_us: {
    'loader_text': 'Loading redstone component resources...',
    'resource_error_title': 'Resource Loading Error',
    'resource_error_message': 'Unable to load redstone component resources. Please ensure your local file structure includes a folder named assets containing all necessary redstone component images.',
    'resource_error_structure': 'The file structure should look like this:',
    'resource_error_hint': 'If you don\'t have these resources yet, please download the complete resource pack and extract it to the project directory.',
    'reload_btn': 'Reload',
    'header_title': 'RedStone Editor',
    'theme_btn': 'Theme',
    'theme_light': 'Light Mode',
    'theme_dark': 'Dark Mode',
    'clear_btn': 'Clear',
    'save_btn': 'Export',
    'load_btn': 'Import',
    'undo_btn': 'Undo',
    'redo_btn': 'Redo',
    'components_panel_title': 'Component Library',
    'category_basic': 'Basic Blocks',
    'category_mechanical': 'Mechanical Components',
    'category_decorative': 'Decorative Blocks',
    'category_special': 'Special Blocks',
    'search_placeholder': 'Search components (English/Chinese/Pinyin)',
    'block_count': 'Placed: {0} components',
    'current_component': 'Current: {0}',
    'cursor_position': 'Coordinates: {0}, {1}',
    'canvas_scale': 'Zoom: {0}%',
    'theme_display': 'Mode: {0}',
    'screenshot_modal_title': 'Screenshot Preview',
    'close_btn': 'Close',
    'download_screenshot_btn': 'Download PNG',
    'save_modal_title': 'Save Design',
    'design_name_label': 'Design Name',
    'design_name_placeholder': 'Enter design name',
    'design_description_label': 'Description (Optional)',
    'design_description_placeholder': 'Enter design description',
    'cancel_btn': 'Cancel',
    'confirm_save_btn': 'Save Design',
    'load_modal_title': 'Import Design',
    'file_drop_text': 'Drag and drop design file here',
    'file_drop_hint': 'Or click to select file',
    'load_status': 'Please select or drag and drop a JSON design file',
    'confirm_load_btn': 'Import Design',
    'clear_confirm_modal_title': 'Clear Canvas',
    'clear_confirm_message': 'Are you sure you want to clear the entire canvas?',
    'clear_confirm_warning': 'This action will permanently remove all placed components and cannot be undone.',
    'confirm_clear_btn': 'Confirm Clear',
    'help_modal_title': 'Help',
    'basic_operations_title': 'Basic Operations',
    'basic_operation_1': 'Select components from the left panel',
    'basic_operation_2': 'Click on the canvas to place components',
    'basic_operation_3': 'Click an occupied cell with the same component again to remove it',
    'basic_operation_4': 'Use the middle mouse button to drag and move the canvas',
    'basic_operation_5': 'Use the mouse wheel to zoom the canvas',
    'keyboard_shortcuts_title': 'Keyboard Shortcuts',
    'shortcut_undo': 'Undo',
    'shortcut_redo': 'Redo',
    'touch_operations_title': 'Touch Controls',
    'touch_operation_1': 'Long-press a placed component to remove it',
    'touch_operation_2': 'Double-tap the canvas to zoom in/out',
    'touch_operation_3': 'Pinch with two fingers to zoom',
    'search_function_title': 'Search Function',
    'search_function_1': 'Supports Chinese name search (e.g., "redstone")',
    'search_function_2': 'Supports Pinyin search (e.g., "hongshi")',
    'search_function_3': 'Supports Pinyin initial search (e.g., "hs")',
    'search_function_4': 'Supports English name search (e.g., "redstone")',
    'zoom_controls_title': 'Zoom Controls',
    'zoom_control_1': 'Zoom in',
    'zoom_control_2': 'Zoom out',
    'zoom_control_3': 'Reset zoom',
    'project_info_title': 'Project Information',
    'project_info_version': 'Project Version: 1.5',
    'project_info_bilibili': 'ZXBHELLO',
    'project_info_email': 'ZXBHELLO@GMAIL.COM',
    'project_info_github': 'MinecraftRedStoneEditor',
    'project_info_feedback': 'Encountered an error? Missing components? Have suggestions? Please visit: Project Issues',
    'error_display_title': 'Error Log',
    'invalid_design_format': 'Invalid design file format',
    'load_error': 'Import failed',
    'file_read_error': 'Error reading file',
    'load_success': 'Design imported successfully',
    'select_file_prompt': 'Please select a design file',
    'selected_file': 'Selected file',
    'unsaved_changes_warning': 'You have unsaved changes. Are you sure you want to leave?',
    'untitled_design': 'Untitled Design',
    'design_file_suffix': 'redstone_design',
    'resource_load_failed': 'Failed to load resources',
    'error': 'Error'
  }
};

/** 当前生效的词条表（与 currentLanguage 保持同步） */
let languageData = {};
/** 当前语言标识：'zh_cn' | 'en_us' */
let currentLanguage = 'zh_cn';

/**
 * 加载指定语言并应用到界面。
 * 语言数据全部内置，直接切换即可；未知语言回退到中文。
 * @param {string} langId 语言标识，默认 'zh_cn'
 */
function loadLanguage(langId = 'zh_cn') {
  currentLanguage = langId;
  languageData = languageDataStore[langId] || languageDataStore.zh_cn;
  applyLanguage();
}

/**
 * 将当前词条应用到界面上的三类元素：
 * - [data-lang]：静态文本（innerHTML / placeholder）
 * - [data-lang-dynamic]：动态文本模板（存到 data-lang-template 供 updateDynamicText 使用）
 * - [data-lang-title]：悬停提示 title
 */
function applyLanguage() {
  document.querySelectorAll('[data-lang]').forEach(element => {
    const key = element.getAttribute('data-lang');
    if (!languageData[key]) return;

    if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
      element.placeholder = languageData[key];
    } else {
      element.innerHTML = languageData[key];
    }
  });

  document.querySelectorAll('[data-lang-dynamic]').forEach(element => {
    const key = element.getAttribute('data-lang-dynamic');
    if (languageData[key]) {
      element.setAttribute('data-lang-template', languageData[key]);
    }
  });

  document.querySelectorAll('[data-lang-title]').forEach(element => {
    const key = element.getAttribute('data-lang-title');
    if (languageData[key]) {
      element.title = languageData[key];
    }
  });

  // 语言切换后刷新状态栏中的动态文本（当前组件、模式、坐标、缩放）
  updateStatusBar();
}

/**
 * 获取指定词条的翻译文本；找不到时原样返回 key。
 * @param {string} key 词条键
 * @returns {string}
 */
function lang(key) {
  return languageData[key] || key;
}

/** 返回当前语言标识，供其他模块（如组件名翻译）判断语言环境 */
function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 用参数填充动态文本模板并写入元素。
 * 模板格式：'已放置: {0} 个组件'，{0}/{1}... 依次替换为传入参数。
 * 元素本身或其内部 [data-lang-template] 均可作为写入目标。
 * @param {string} elementId 目标元素 id
 * @param {...*} args 模板占位符 {0}、{1}... 的填充值
 */
function updateDynamicText(elementId, ...args) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const target = element.hasAttribute('data-lang-template')
    ? element
    : element.querySelector('[data-lang-template]');
  if (!target) return;

  let template = target.getAttribute('data-lang-template');
  args.forEach((arg, index) => {
    template = template.replace(`{${index}}`, arg);
  });
  target.innerHTML = template;
}

/** 在 中文 <-> 英文 之间切换 */
function toggleLanguage() {
  const newLanguage = currentLanguage === 'zh_cn' ? 'en_us' : 'zh_cn';
  loadLanguage(newLanguage);
}

// 绑定顶栏语言切换按钮（独立监听，避免与其他按钮的冒泡冲突）
document.addEventListener('DOMContentLoaded', () => {
  const languageToggle = document.getElementById('language-toggle');
  if (languageToggle) {
    languageToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleLanguage();
    });
  }
});

// 暴露给其他脚本模块（各文件以传统 script 顺序加载，共享全局作用域）
window.updateDynamicText = updateDynamicText;
window.loadLanguage = loadLanguage;
window.toggleLanguage = toggleLanguage;
window.lang = lang;
window.getCurrentLanguage = getCurrentLanguage;
