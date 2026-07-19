// 内置语言数据（避免file://协议下无法加载的问题）
const languageDataStore = {
    zh_cn: {
        "loader_text": "正在加载红石组件资源...",
        "resource_error_title": "资源加载错误",
        "resource_error_message": "无法加载红石组件资源。请确保您的本地文件结构包含一个名为 assets 的文件夹，其中包含所有必要的红石组件图片。",
        "resource_error_structure": "文件结构应如下所示：",
        "resource_error_hint": "如果您还没有这些资源，请下载完整的资源包并解压到项目目录中。",
        "reload_btn": "重新加载",
        "header_title": "RedStone Editor",
        "theme_btn": "主题",
        "clear_btn": "清空",
        "screenshot_btn": "截图",
        "save_btn": "导出",
        "load_btn": "导入",
        "help_btn": "帮助",
        "undo_btn": "撤销",
        "redo_btn": "重做",
        "components_panel_title": "组件库",
        "category_basic": "基础方块",
        "category_mechanical": "机械元件",
        "category_decorative": "装饰方块",
        "category_special": "特殊方块",
        "search_placeholder": "搜索组件（中文/拼音/英文）",
        "block_count": "已放置: {0} 个组件",
        "current_component": "当前: 空气",
        "cursor_position": "坐标: {0}, {1}",
        "canvas_scale": "缩放: {0}%",
        "theme_display": "模式: 日间模式",
        "screenshot_modal_title": "截图预览",
        "close_btn": "关闭",
        "download_screenshot_btn": "下载PNG",
        "save_modal_title": "保存设计",
        "design_name_label": "设计名称",
        "design_name_placeholder": "输入设计名称",
        "design_description_label": "描述 (可选)",
        "design_description_placeholder": "输入设计描述",
        "cancel_btn": "取消",
        "confirm_save_btn": "保存设计",
        "load_modal_title": "导入设计",
        "file_drop_text": "拖放设计文件到这里",
        "file_drop_hint": "或点击选择文件",
        "load_status": "请选择或拖放JSON设计文件",
        "confirm_load_btn": "导入设计",
        "clear_confirm_modal_title": "清空画布",
        "clear_confirm_message": "确定要清空整个画布吗？",
        "clear_confirm_warning": "此操作将永久移除所有已放置的组件且无法撤销。",
        "confirm_clear_btn": "确认清空",
        "help_modal_title": "使用帮助",
        "basic_operations_title": "基本操作",
        "basic_operation_1": "从左侧面板选择组件",
        "basic_operation_2": "在画布上点击放置组件",
        "basic_operation_3": "再次点击同一位置可移除组件",
        "basic_operation_4": "使用鼠标中键拖拽移动画布",
        "basic_operation_5": "使用滚轮缩放画布",
        "search_function_title": "搜索功能",
        "search_function_1": "支持中文名称搜索（如'红石'）",
        "search_function_2": "支持拼音搜索（如'hongshi'）",
        "search_function_3": "支持拼音首字母搜索（如'hs'）",
        "search_function_4": "支持英文名称搜索（如'redstone'）",
        "zoom_controls_title": "缩放控制",
        "zoom_control_1": "放大视图",
        "zoom_control_2": "缩小视图",
        "zoom_control_3": "重置缩放",
        "project_info_title": "项目信息",
        "project_info_version": "项目版本：1.3",
        "project_info_bilibili": "BILIBILI：ZXBHELLO",
        "project_info_email": "E-MAIL：ZXBHELLO@GMAIL.COM",
        "project_info_github": "GITHUB：MinecraftRedStoneEditor",
        "project_info_feedback": "遇到错误？缺少组件？提供想法？请前往：项目提议",
        "error_display_title": "错误日志"
    },
    en_us: {
        "loader_text": "Loading redstone component resources...",
        "resource_error_title": "Resource Loading Error",
        "resource_error_message": "Unable to load redstone component resources. Please ensure your local file structure includes a folder named assets containing all necessary redstone component images.",
        "resource_error_structure": "The file structure should look like this:",
        "resource_error_hint": "If you don't have these resources yet, please download the complete resource pack and extract it to the project directory.",
        "reload_btn": "Reload",
        "header_title": "RedStone Editor",
        "theme_btn": "Theme",
        "clear_btn": "Clear",
        "screenshot_btn": "Screenshot",
        "save_btn": "Export",
        "load_btn": "Import",
        "help_btn": "Help",
        "undo_btn": "Undo",
        "redo_btn": "Redo",
        "components_panel_title": "Component Library",
        "category_basic": "Basic Blocks",
        "category_mechanical": "Mechanical Components",
        "category_decorative": "Decorative Blocks",
        "category_special": "Special Blocks",
        "search_placeholder": "Search components (English/Chinese/Pinyin)",
        "block_count": "Placed: {0} components",
        "current_component": "Current: Air",
        "cursor_position": "Coordinates: {0}, {1}",
        "canvas_scale": "Zoom: {0}%",
        "theme_display": "Mode: Light Mode",
        "screenshot_modal_title": "Screenshot Preview",
        "close_btn": "Close",
        "download_screenshot_btn": "Download PNG",
        "save_modal_title": "Save Design",
        "design_name_label": "Design Name",
        "design_name_placeholder": "Enter design name",
        "design_description_label": "Description (Optional)",
        "design_description_placeholder": "Enter design description",
        "cancel_btn": "Cancel",
        "confirm_save_btn": "Save Design",
        "load_modal_title": "Import Design",
        "file_drop_text": "Drag and drop design file here",
        "file_drop_hint": "Or click to select file",
        "load_status": "Please select or drag and drop a JSON design file",
        "confirm_load_btn": "Import Design",
        "clear_confirm_modal_title": "Clear Canvas",
        "clear_confirm_message": "Are you sure you want to clear the entire canvas?",
        "clear_confirm_warning": "This action will permanently remove all placed components and cannot be undone.",
        "confirm_clear_btn": "Confirm Clear",
        "help_modal_title": "Help",
        "basic_operations_title": "Basic Operations",
        "basic_operation_1": "Select components from the left panel",
        "basic_operation_2": "Click on the canvas to place components",
        "basic_operation_3": "Click again on the same position to remove components",
        "basic_operation_4": "Use the middle mouse button to drag and move the canvas",
        "basic_operation_5": "Use the mouse wheel to zoom the canvas",
        "search_function_title": "Search Function",
        "search_function_1": "Supports Chinese name search (e.g., 'redstone')",
        "search_function_2": "Supports Pinyin search (e.g., 'hongshi')",
        "search_function_3": "Supports Pinyin initial search (e.g., 'hs')",
        "search_function_4": "Supports English name search (e.g., 'redstone')",
        "zoom_controls_title": "Zoom Controls",
        "zoom_control_1": "Zoom in",
        "zoom_control_2": "Zoom out",
        "zoom_control_3": "Reset zoom",
        "project_info_title": "Project Information",
        "project_info_version": "Project Version: 1.3",
        "project_info_bilibili": "ZXBHELLO",
        "project_info_email": "ZXBHELLO@GMAIL.COM",
        "project_info_github": "MinecraftRedStoneEditor",
        "project_info_feedback": "Encountered an error? Missing components? Have suggestions? Please visit: Project Issues",
        "error_display_title": "Error Log"
    }
};

let languageData = {};
let currentLanguage = 'zh_cn';

// 直接从内置数据加载语言，无需外部文件
function loadLanguage(lang = 'zh_cn') {
    try {
        currentLanguage = lang;
        // 优先使用内置语言数据
        if (languageDataStore[lang]) {
            languageData = languageDataStore[lang];
            applyLanguage();
            return;
        }
        
        // 如果内置数据中没有，尝试从外部文件加载（部署到服务器时可用）
        fetch(`assets/lang/${lang}.json`)
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(data => {
                languageData = data;
                applyLanguage();
            })
            .catch(error => {
                console.warn('语言文件加载失败，使用默认中文:', error.message);
                languageData = languageDataStore.zh_cn;
                currentLanguage = 'zh_cn';
                applyLanguage();
            });
    } catch (error) {
        console.warn('loadLanguage error:', error.message);
        languageData = languageDataStore.zh_cn;
        currentLanguage = 'zh_cn';
        applyLanguage();
    }
}

function applyLanguage() {
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang');
        if (languageData[key]) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = languageData[key];
            } else {
                element.innerHTML = languageData[key];
            }
        }
    });
    const dynamicElements = document.querySelectorAll('[data-lang-dynamic]');
    dynamicElements.forEach(element => {
        const key = element.getAttribute('data-lang-dynamic');
        if (languageData[key]) {
            element.setAttribute('data-lang-template', languageData[key]);
        }
    });
}

// 获取语言文本的函数
function lang(key) {
    return languageData[key] || key;
}

function updateDynamicText(elementId, ...args) {
    const element = document.getElementById(elementId);
    if (element && element.hasAttribute('data-lang-template')) {
        let template = element.getAttribute('data-lang-template');
        args.forEach((arg, index) => {
            template = template.replace(`{${index}}`, arg);
        });
        element.innerHTML = template;
    }
}

// 切换语言函数
function toggleLanguage() {
    const newLanguage = currentLanguage === 'zh_cn' ? 'en_us' : 'zh_cn';
    loadLanguage(newLanguage);
}

document.addEventListener('DOMContentLoaded', () => {
    // 直接加载内置语言，无需等待
    loadLanguage('zh_cn');
    
    // 设置语言切换按钮事件监听器
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleLanguage();
        });
    }
});

window.updateDynamicText = updateDynamicText;
window.loadLanguage = loadLanguage;
window.toggleLanguage = toggleLanguage;
window.lang = lang;
