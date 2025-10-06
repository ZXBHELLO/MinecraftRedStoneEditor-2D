# 关于

这个项目的原作者是ZXBHELLO。
这个项目相当不错，本fork的核心意义是进行部分问题解决与功能增加。
新的功能/修复将在此列出：
- 2025/10/6 解决图像渲染模糊问题
- 2025/10/6 分离各个组建以方便维护

测试地址：https://hotpad100c.github.io/MinecraftRedStoneEditor-2D/

# Minecraft RedStone Editor 2D

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web-lightgrey.svg)](https://github.com/ZXBHELLO/MinecraftRedStoneEditor-2D)

一个基于Web的Minecraft红石电路设计工具，让你可以随时随地设计和模拟红石电路。

> 参考了 rs editor 并进行了大量优化

## 特性

- 🧱 **丰富的组件库** - 包含基础方块、机械元件、装饰方块和特殊方块四大类红石组件
- 🌙 **护眼夜间模式** - 支持日间/夜间主题切换，长时间使用更舒适
- 📱 **响应式设计** - 自动适配不同设备屏幕尺寸，支持手机、平板和电脑
- 💾 **导入/导出功能** - 可以保存你的设计并在不同设备间共享
- 🔍 **智能搜索** - 支持中文、拼音和英文搜索组件
- 🌐 **纯静态页面** - 无需服务器，直接打开HTML文件即可使用
- 🆓 **完全开源** - 代码完全开源，可以自由修改和分发

## 快速开始

### 在线使用

- https://rseditor.zxbhello.top/
- https://redstone.22web.org/

### 本地使用

1. 下载或克隆本项目到本地
2. 确保项目包含 `assets` 文件夹及其中的所有组件图片
3. 在浏览器中打开 `index.html` 文件
4. 开始设计你的红石电路！

## 使用说明

1. **选择组件** - 从左侧面板选择需要的红石组件
2. **放置组件** - 在画布上点击放置选中的组件
3. **移除组件** - 再次点击同一位置可移除组件
4. **移动画布** - 使用鼠标中键或右键拖拽移动画布
5. **缩放画布** - 使用鼠标滚轮或右下角缩放按钮控制画布缩放
6. **搜索组件** - 使用顶部搜索框快速查找组件（支持中文、拼音、英文）

## 组件分类

- **基础方块**: 空气、基岩、平滑石、黑曜石等
- **机械元件**: 红石粉、红石火把、中继器、比较器、活塞等
- **装饰方块**: 箱子、熔炉、附魔台等
- **特殊方块**: 水、熔岩、火等

## 项目结构

```
MinecraftRedStoneEditor-2D/
├── index.html
├── README.md
└── assets/
    ├── air.webp
    ├── sand.webp
    ├── smoothstone.webp
    └── ...
```

## 开发

本项目为纯前端项目，使用原生HTML、CSS和JavaScript开发，无需构建工具。

### 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

本项目采用MIT许可证，详情请见[LICENSE](LICENSE)文件。

## 致谢

- 感谢 rs editor 项目的启发
- 所有组件图片来源于Minecraft

如果你觉得这个项目有用，欢迎给个Star！⭐
