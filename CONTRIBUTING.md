# 贡献指南

感谢您对呈尚策划人事管理系统的关注！我们欢迎任何形式的贡献。

## 🤝 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议，请：

1. 检查 [Issues](https://github.com/your-username/hr-management-system/issues) 确保问题未被报告
2. 创建新的 Issue，包含：
   - 清晰的标题和描述
   - 重现步骤（如果是 bug）
   - 期望的行为
   - 实际的行为
   - 环境信息（操作系统、浏览器、Node.js 版本等）

### 提交代码

1. **Fork 项目**
   ```bash
   git clone https://github.com/your-username/hr-management-system.git
   cd hr-management-system
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **开发和测试**
   ```bash
   npm run dev
   ```

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request**

## 📝 代码规范

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码运行）
- `refactor`: 代码重构
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动

**示例:**
```
feat(employees): add employee search functionality
fix(recruitment): resolve trial period calculation bug
docs(readme): update installation instructions
```

### 代码风格

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 配置的代码规范
- 使用 Prettier 进行代码格式化
- 组件名使用 PascalCase
- 文件名使用 kebab-case
- 变量和函数名使用 camelCase

### 目录结构规范

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   └── [feature]/         # 功能页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── forms/            # 表单组件
│   └── charts/           # 图表组件
├── lib/                  # 工具库
├── models/               # 数据模型
├── types/                # TypeScript 类型
└── utils/                # 工具函数
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

### 编写测试

- 为新功能编写单元测试
- 为 API 端点编写集成测试
- 为关键用户流程编写端到端测试

## 🔍 代码审查

所有的 Pull Request 都需要经过代码审查：

1. **自我检查清单**
   - [ ] 代码遵循项目规范
   - [ ] 添加了必要的测试
   - [ ] 更新了相关文档
   - [ ] 没有引入新的 ESLint 错误
   - [ ] 功能正常工作

2. **审查重点**
   - 代码质量和可读性
   - 性能影响
   - 安全性考虑
   - 向后兼容性

## 🚀 发布流程

1. 更新版本号（遵循语义化版本）
2. 更新 CHANGELOG.md
3. 创建 Git 标签
4. 发布到生产环境

## 📚 开发资源

### 技术文档
- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [MongoDB 文档](https://docs.mongodb.com/)

### 设计资源
- [Radix UI](https://www.radix-ui.com/) - UI 组件库
- [Lucide](https://lucide.dev/) - 图标库
- [Tailwind UI](https://tailwindui.com/) - 设计参考

## 💬 社区

- **讨论**: [GitHub Discussions](https://github.com/your-username/hr-management-system/discussions)
- **问题**: [GitHub Issues](https://github.com/your-username/hr-management-system/issues)
- **邮箱**: tech@chengshang.com

## 📄 许可证

通过贡献代码，您同意您的贡献将在 [MIT 许可证](LICENSE) 下授权。

---

再次感谢您的贡献！🎉
