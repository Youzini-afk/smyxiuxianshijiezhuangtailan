# 修仙世界状态栏

这是基于 tavern_helper_template 的状态栏项目入口，读取 `stat_data` 中的修仙世界变量并渲染为三态界面：

- 悬浮球态
- 悬浮窗态
- 正文嵌入态

## 入口文件

- `index.ts`: 等待 Mvu 初始化后挂载 Vue 应用
- `App.vue`: 主界面、拖拽、弹窗、三态切换
- `schema.ts`: 修仙世界变量结构定义
- `store.ts`: 基于 `defineMvuDataStore` 的响应式数据绑定

## 数据来源

界面默认读取当前消息楼层的 `stat_data`，并按以下大类展示：

- 世界定位
- 用户信息
- 背包
- 功法与法宝
- 在场人物
- 男性好感度 / 女性好感度

## 构建产物

执行 `pnpm build` 后，状态栏页面产物位于 `dist/修仙世界状态栏/index.html`。
