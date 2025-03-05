# Juggl 插件开发指南

## 开发环境设置

### 构建与部署

本项目使用了一个自动化构建脚本 `build-copy.ps1`，它可以：

1. 构建 Juggl 插件
2. 将构建后的文件自动复制到 Obsidian 插件目录

### 使用方法

每次修改代码后，只需运行以下命令：

```powershell
.\build-copy.ps1
```

这个脚本会：
- 使用 Rollup 构建项目
- 检查必要的构建文件是否存在
- 将文件复制到 Obsidian 插件目录
- 验证文件是否成功复制
- 显示详细的诊断信息

### 热重载支持

为了支持热重载功能，请确保：

1. 在 Obsidian 中安装了 [Hot-Reload](https://github.com/pjeby/hot-reload) 插件
2. 项目根目录中存在 `.hotreload` 文件（已包含在项目中）

当你运行 `build-copy.ps1` 脚本后，Hot-Reload 插件会自动检测到文件变化并重新加载 Juggl 插件，无需重启 Obsidian。

### 故障排除

如果 Juggl 插件在 Obsidian 中不显示：

1. 检查构建脚本的输出，确保文件已成功复制
2. 确认 Obsidian 插件目录路径是否正确
3. 在 Obsidian 中禁用并重新启用 Juggl 插件
4. 检查 Obsidian 开发者控制台中是否有错误信息

## 开发工作流程

1. 修改代码
2. 运行 `.\build-copy.ps1`
3. 切换到 Obsidian 查看更改
4. 重复上述步骤

这种工作流程避免了使用符号链接，提供了更可靠的开发体验。 