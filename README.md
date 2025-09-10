# 呈尚策划人事管理系统

一个基于 Next.js 15 和 MongoDB 构建的现代化人事管理系统，提供完整的员工管理、招聘管理、积分管理和年度评优功能。

## 🌟 项目特色

- **现代化技术栈**：Next.js 15 + TypeScript + MongoDB + Tailwind CSS 4
- **精美UI设计**：渐变背景、毛玻璃效果、现代化卡片设计
- **响应式设计**：完美适配桌面端、平板和移动设备
- **动画交互**：平滑过渡动画、悬停效果、交互反馈
- **云端部署优化**：支持 Vercel 一键部署，构建错误自动处理
- **数据可视化**：使用 Recharts 提供丰富的图表展示
- **实时统计**：动态计算和展示关键业务指标
- **安全保护**：身份证隐私保护和操作权限密码验证
- **灵活积分系统**：支持负积分管理，无最小值限制
- **证书生成**：支持生成和打印专业的获奖证书
- **数据导出**：支持 Excel 格式的数据导出功能

## 🚀 核心功能

### 📊 系统主页
- **现代化界面**：采用渐变背景和毛玻璃效果的现代化设计
- **欢迎横幅**：精美的渐变横幅展示系统标题和介绍
- **系统健康监控**：实时显示系统状态、数据库响应时间和数据统计
- **核心模块导航**：招聘记录管理和员工贡献评估两大核心模块
- **功能价值展示**：详细展示各模块的核心价值和功能特点
- **响应式布局**：完美适配各种屏幕尺寸，提供优秀的用户体验

### 👥 招聘记录管理
- **统计概览**：招聘总人数、试岗率、试岗离职率、平均试岗天数
- **面试记录**：完整的面试信息记录和管理
- **试岗管理**：试岗状态跟踪、试岗天数统计
- **状态管理**：面试中、试岗中、已录用、已拒绝等状态流转
- **隐私保护**：身份证号自动隐藏，需要密码查看完整信息
- **权限控制**：编辑和删除操作需要密码验证
- **数据导出**：支持 Excel 格式导出招聘数据

### 🏢 员工信息管理
- **统计概览**：员工总数、在职员工数、平均在职天数、积分最多员工
- **档案管理**：员工基本信息、部门岗位、在职状况等
- **积分跟踪**：员工总积分显示和排名，支持负积分管理
- **状态管理**：在职、离职、休假等状态管理
- **全员显示**：默认显示所有员工信息，无状态筛选限制
- **隐私保护**：身份证号自动隐藏，需要密码查看完整信息
- **权限控制**：编辑和设置离职操作需要密码验证
- **搜索筛选**：支持按姓名、员工ID、部门、岗位等条件筛选

### 📈 积分管理系统
- **积分记录**：详细的积分变动记录和原因
- **行为分类**：工作表现、考勤情况、团队协作等分类管理
- **统计分析**：积分趋势分析、员工排名等
- **证据管理**：支持上传积分变动的相关证据

### 🏆 年度评优管理
- **评优记录**：年度评优的完整记录管理
- **综合评分**：基于积分、考勤、绩效的综合评分算法
- **奖项管理**：特等奖、一等奖、二等奖、三等奖等级管理
- **证书生成**：自动生成专业的获奖证书，支持打印和保存
- **统计分析**：年度评优数据统计和趋势分析

### 🔐 安全保护功能
- **身份证隐私保护**：身份证号自动隐藏为 `110101********6789` 格式
- **密码验证查看**：点击小眼睛图标需要输入密码 `csch903` 查看完整身份证号
- **操作权限控制**：编辑、删除、设置离职等敏感操作需要密码验证
- **统一密码管理**：所有安全操作使用统一的操作密码
- **错误处理机制**：密码错误时显示提示信息并清空输入框
- **取消操作支持**：用户可以随时取消密码验证操作

## 🛠️ 技术栈

### 前端技术
- **Next.js 15**：React 全栈框架，支持 App Router 和 Turbopack
- **React 19**：最新的 React 版本
- **TypeScript**：类型安全的 JavaScript
- **Tailwind CSS 4**：原子化 CSS 框架，支持现代渐变和动画
- **Radix UI**：无障碍的 UI 组件库
- **Lucide React**：现代化图标库
- **React Hook Form**：高性能表单库
- **Zod**：TypeScript 优先的数据验证库
- **Framer Motion**：高性能动画库（可选）

### 后端技术
- **Next.js API Routes**：服务端 API 接口
- **MongoDB**：NoSQL 数据库
- **Mongoose**：MongoDB 对象建模库

### 工具库
- **date-fns**：现代化日期处理库
- **Recharts**：React 图表库
- **html2canvas**：HTML 转图片
- **jsPDF**：PDF 生成库
- **xlsx**：Excel 文件处理
- **Sonner**：现代化通知组件

## 📁 项目结构

```
hr-management-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── awards/        # 年度评优 API
│   │   │   ├── employees/     # 员工管理 API
│   │   │   ├── recruitment/   # 招聘管理 API
│   │   │   └── scores/        # 积分管理 API
│   │   ├── awards/            # 年度评优页面
│   │   ├── certificate/       # 证书页面
│   │   ├── employees/         # 员工管理页面
│   │   ├── recruitment/       # 招聘管理页面
│   │   ├── scores/            # 积分管理页面
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 主页
│   ├── components/            # React 组件
│   │   ├── charts/           # 图表组件
│   │   ├── forms/            # 表单组件
│   │   ├── layout/           # 布局组件
│   │   └── ui/               # UI 基础组件
│   ├── constants/            # 常量定义
│   ├── hooks/                # 自定义 Hooks
│   ├── lib/                  # 工具库
│   ├── models/               # 数据模型
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 工具函数
├── public/                   # 静态资源
├── package.json             # 项目依赖
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.js      # Tailwind CSS 配置
└── next.config.ts          # Next.js 配置
```

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- MongoDB 4.4 或更高版本（支持云数据库如 Sealos）
- npm、yarn、pnpm 或 bun 包管理器

### 云端部署支持

本项目已优化支持云端部署：
- **Vercel**：一键部署，自动构建
- **Sealos**：云数据库支持
- **GitHub**：代码托管和自动化部署

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd hr-management-system
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **环境配置**

创建 `.env.local` 文件并配置以下环境变量：

```env
# MongoDB 连接字符串（本地）
MONGODB_URI=mongodb://localhost:27017/hr-management

# 或使用云数据库（如 Sealos）
# MONGODB_URI=mongodb://root:your-password@your-host:port/?directConnection=true

# 环境配置
NODE_ENV=development
```

4. **启动 MongoDB**

确保 MongoDB 服务正在运行：

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# Windows
net start MongoDB

# Linux (systemd)
sudo systemctl start mongod
```

5. **启动开发服务器**

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

6. **访问应用**

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 生产环境部署

#### 本地部署

1. **构建项目**
```bash
npm run build
```

2. **启动生产服务器**
```bash
npm run start
```

#### Vercel 云端部署

1. **推送代码到 GitHub**
```bash
git add .
git commit -m "准备部署"
git push origin main
```

2. **在 Vercel 中部署**
   - 访问 [Vercel](https://vercel.com)
   - 连接 GitHub 仓库
   - 配置环境变量：`MONGODB_URI`
   - 一键部署

3. **部署配置**
   - 项目已包含 `vercel.json` 配置文件
   - 自动处理构建时的类型检查问题
   - 支持免费计划的单区域部署

> 📋 详细的 Vercel 部署指南请参考项目中的 `README-DEPLOYMENT.md` 文件

## 📖 使用指南

### 🔐 系统密码

系统使用统一的操作密码来保护敏感数据和重要操作：

**操作密码：`csch903`**

此密码用于以下场景：
- **查看身份证号**：点击身份证号旁的小眼睛图标查看完整身份证信息
- **编辑操作**：编辑招聘记录或员工信息时需要密码验证
- **删除操作**：删除招聘记录或设置员工离职时需要密码验证

> ⚠️ **安全提示**：请妥善保管操作密码，建议在生产环境中修改为更安全的密码。

### 系统初始化

首次使用系统时，建议按以下顺序进行：

1. **添加员工信息**：在员工管理模块中添加基础员工信息
2. **录入招聘记录**：在招聘管理模块中录入历史招聘数据
3. **设置积分规则**：在积分管理模块中建立积分评价体系
4. **配置年度评优**：在年度评优模块中设置评优标准

### 主要操作流程

#### 招聘流程
1. 创建面试记录 → 2. 设置试岗信息 → 3. 更新招聘状态 → 4. 生成统计报告

#### 员工管理流程
1. 录入员工档案 → 2. 设置部门岗位 → 3. 跟踪在职状态 → 4. 管理积分变动

#### 年度评优流程
1. 设置评优标准 → 2. 计算综合得分 → 3. 确定获奖名单 → 4. 生成获奖证书

## 🔧 开发指南

### 代码规范

项目使用以下代码规范：

- **ESLint**：代码质量检查
- **TypeScript**：类型安全
- **Prettier**：代码格式化（建议配置）

### 数据库设计

#### 主要数据模型

1. **Employee（员工）**
   - 基本信息：姓名、性别、联系方式
   - 工作信息：员工ID、部门、岗位、在职状态
   - 积分信息：总积分、转正日期、在职天数

2. **RecruitmentRecord（招聘记录）**
   - 面试信息：面试日期、应聘者信息
   - 试岗信息：试岗日期、试岗天数、试岗状态
   - 状态管理：招聘状态、离职原因

3. **ScoreRecord（积分记录）**
   - 积分变动：员工ID、积分变化、变动原因
   - 分类管理：行为类型、记录日期、记录人
   - 证据管理：相关证据文件

4. **AnnualAward（年度评优）**
   - 评优信息：年度、奖项等级、获奖员工
   - 评分数据：积分、考勤、绩效得分
   - 综合评价：最终得分、排名

### API 接口

#### 统计接口
- `GET /api/dashboard/stats` - 主页统计数据
- `GET /api/recruitment/overview` - 招聘概览统计
- `GET /api/employees/overview` - 员工概览统计

#### 数据管理接口
- `GET/POST/PUT/DELETE /api/employees` - 员工管理
- `GET/POST/PUT/DELETE /api/recruitment` - 招聘管理
- `GET/POST/PUT/DELETE /api/scores` - 积分管理
- `GET/POST/PUT/DELETE /api/awards` - 年度评优管理

### 自定义开发

#### 添加新功能模块

1. 在 `src/app` 中创建新的页面路由
2. 在 `src/app/api` 中创建对应的 API 路由
3. 在 `src/models` 中定义数据模型
4. 在 `src/components` 中创建相关组件
5. 在 `src/types` 中定义 TypeScript 类型

#### 自定义样式

项目使用 Tailwind CSS，可以通过以下方式自定义样式：

1. 修改 `tailwind.config.js` 配置文件
2. 在 `src/app/globals.css` 中添加全局样式
3. 使用 CSS Modules 或 styled-components（需要额外配置）

## 🎯 功能特性详解

### 数据可视化
- **实时图表**：使用 Recharts 提供动态数据图表
- **趋势分析**：月度、年度数据趋势展示
- **对比分析**：同比、环比数据对比

### 数据导出功能
- **Excel 导出**：支持员工信息、招聘记录等数据导出
- **PDF 证书**：自动生成获奖证书 PDF 文件
- **打印优化**：专门的打印样式优化

### 响应式设计
- **移动端适配**：完美支持手机和平板设备
- **触摸优化**：针对触摸设备的交互优化
- **自适应布局**：根据屏幕尺寸自动调整布局

### 数据验证
- **前端验证**：使用 Zod 进行客户端数据验证
- **后端验证**：Mongoose Schema 级别的数据验证
- **类型安全**：TypeScript 提供编译时类型检查

## 🔍 常见问题

### Q: 如何重置数据库？
A: 可以通过 MongoDB 客户端删除数据库，系统会自动重新创建：
```bash
# 连接 MongoDB
mongo
# 删除数据库
use hr-management
db.dropDatabase()
```

### Q: 如何修改端口号？
A: 在 `package.json` 中修改启动脚本：
```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

### Q: 如何配置 HTTPS？
A: 在生产环境中，建议使用反向代理（如 Nginx）来处理 HTTPS：
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Q: 如何备份数据？
A: 使用 MongoDB 的 mongodump 工具：
```bash
# 备份数据库
mongodump --db hr-management --out /path/to/backup

# 恢复数据库
mongorestore --db hr-management /path/to/backup/hr-management
```

### Q: 如何添加新的部门或岗位？
A: 在 `src/constants/index.ts` 文件中修改 `DEPARTMENTS` 和 `POSITIONS` 常量：
```typescript
export const DEPARTMENTS = [
  '销售部',
  '运营部',
  '人事部',
  '技术部', // 新增部门
  '未分配'
];
```

### Q: 如何修改操作密码？
A: 在 `src/components/ui/password-verification.tsx` 文件中修改密码常量：
```typescript
const handlePasswordSubmit = () => {
  if (password === 'your-new-password') { // 修改这里的密码
    onSuccess();
    onClose();
  } else {
    setError('密码错误，请重新输入');
    setPassword('');
  }
};
```

### Q: 忘记操作密码怎么办？
A: 默认操作密码是 `csch903`。如果修改后忘记，可以：
1. 查看 `src/components/ui/password-verification.tsx` 文件中的密码设置
2. 或者重新设置新的密码
3. 建议将密码记录在安全的地方

## 🚨 注意事项

### 安全建议
1. **生产环境**：务必修改默认的数据库连接字符串
2. **操作密码**：生产环境中建议修改默认操作密码 `csch903`
3. **访问控制**：建议添加身份验证和权限管理
4. **数据备份**：定期备份重要数据
5. **HTTPS**：生产环境使用 HTTPS 协议
6. **环境变量**：使用 `.env.local` 管理敏感信息，不要提交到代码仓库
7. **Vercel 部署**：在 Vercel 面板中安全配置环境变量

### 性能优化
1. **数据库索引**：为常用查询字段添加索引
2. **图片优化**：使用 Next.js Image 组件优化图片
3. **缓存策略**：合理使用浏览器缓存和 CDN
4. **代码分割**：利用 Next.js 的自动代码分割

### 浏览器兼容性
- **现代浏览器**：Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
- **移动浏览器**：iOS Safari 14+、Chrome Mobile 90+
- **不支持**：Internet Explorer
- **推荐配置**：支持 CSS Grid、Flexbox、ES2017+ 的现代浏览器

## 📊 系统监控

### 性能指标
- **页面加载时间**：< 2 秒
- **API 响应时间**：< 500ms
- **数据库查询时间**：< 100ms

### 错误监控
建议集成错误监控服务：
- **Sentry**：错误追踪和性能监控
- **LogRocket**：用户会话录制
- **Google Analytics**：用户行为分析

## 🤝 贡献指南

### 开发流程
1. Fork 项目仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

### 代码提交规范
使用 Conventional Commits 规范：
```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目的支持：
- [Next.js](https://nextjs.org/) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 无障碍 UI 组件
- [MongoDB](https://www.mongodb.com/) - 数据库
- [Recharts](https://recharts.org/) - 图表库

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- **项目地址**：[GitHub Repository](https://github.com/XUXIKAI886/renshiguanlixitong)
- **问题反馈**：[GitHub Issues](https://github.com/XUXIKAI886/renshiguanlixitong/issues)
- **在线演示**：[Vercel 部署地址](https://your-vercel-app.vercel.app)

## 🔗 相关资源

- **部署指南**：[README-DEPLOYMENT.md](README-DEPLOYMENT.md)
- **更新日志**：[CHANGELOG.md](CHANGELOG.md)
- **贡献指南**：[CONTRIBUTING.md](CONTRIBUTING.md)
- **许可证**：[LICENSE](LICENSE)

---

**呈尚策划人事管理系统** - 让人事管理更简单、更高效！ 🚀
