# 呈尚策划人事管理系统

一个基于 Next.js 15 和 MongoDB 构建的现代化人事管理系统，提供完整的员工管理、招聘管理、积分管理和年度评优功能。

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.18.1-green)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 项目特色

- **现代化技术栈**：Next.js 15 + TypeScript + MongoDB + Tailwind CSS 4
- **精美UI设计**：渐变背景、毛玻璃效果、现代化卡片设计
- **响应式设计**：完美适配桌面端、平板和移动设备
- **动画交互**：平滑过渡动画、悬停效果、交互反馈
- **云端部署优化**：支持 Vercel 一键部署，构建错误自动处理
- **数据可视化**：使用 Recharts 提供丰富的图表展示
- **实时统计**：动态计算和展示关键业务指标
- **安全保护**：身份证隐私保护和操作权限密码验证
- **灵活数据管理**：智能字段验证、类型安全转换、自动数据修复
- **岗位体系统一**：招聘与员工管理岗位选择保持一致，便于数据流转
- **数据完整性保障**：自动检测修复缺失字段，平滑升级历史数据
- **灵活积分系统**：支持负积分管理，无最小值限制
- **证书生成**：支持生成和打印专业的获奖证书
- **数据导出**：支持 Excel 格式的数据导出功能
- **开发友好**：完整的调试日志链路，详细的错误诊断信息

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
- **应聘岗位管理**：标准化岗位选择，与员工管理岗位体系一致
  - 支持9个标准岗位：销售主管、人事主管、运营主管、销售、运营、助理、客服、美工、未分配
  - 列表页面直观展示应聘岗位，便于筛选和统计
  - 数据完整性自动维护，历史记录平滑升级
- **年龄管理**：必填年龄字段，支持16-70岁范围验证
- **身份证管理**：身份证号完全可选，灵活应对不同招聘场景
  - 智能验证逻辑，空值时跳过格式检查
  - 支持无身份证信息的应聘者记录
- **试岗管理**：试岗状态跟踪、试岗天数统计
- **状态管理**：面试中、试岗中、已录用、已拒绝等状态流转
- **隐私保护**：身份证号自动隐藏，需要密码查看完整信息
- **权限控制**：编辑和删除操作需要密码验证
- **数据导出**：支持 Excel 格式导出招聘数据
- **表单优化**：类型安全的表单处理，防止数据类型错误

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
│   │   │   │   ├── [id]/      # 单个奖励操作
│   │   │   │   ├── generate/  # 奖励生成
│   │   │   │   └── statistics/ # 奖励统计
│   │   │   ├── dashboard/     # 仪表盘 API
│   │   │   ├── employees/     # 员工管理 API
│   │   │   │   ├── [id]/      # 单个员工操作
│   │   │   │   └── overview/  # 员工概览
│   │   │   ├── recruitment/   # 招聘管理 API
│   │   │   │   ├── [id]/      # 单个招聘记录操作
│   │   │   │   ├── overview/  # 招聘概览
│   │   │   │   └── stats/     # 招聘统计
│   │   │   ├── scores/        # 积分管理 API
│   │   │   │   ├── [id]/      # 单个积分记录操作
│   │   │   │   └── statistics/ # 积分统计
│   │   │   ├── fix/           # 数据修复 API
│   │   │   │   └── recruitment-position/ # 招聘岗位字段修复
│   │   │   ├── migrate/       # 数据迁移 API  
│   │   │   │   └── recruitment-position/ # 招聘岗位字段迁移
│   │   │   └── health/        # 系统健康检查
│   │   ├── awards/            # 年度评优页面
│   │   ├── certificate/       # 证书页面
│   │   │   └── [id]/         # 动态证书页面
│   │   ├── employees/         # 员工管理页面
│   │   ├── recruitment/       # 招聘管理页面
│   │   │   └── dashboard/    # 招聘仪表盘
│   │   ├── scores/            # 积分管理页面
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 主页
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   │   ├── charts/           # 图表组件
│   │   │   ├── AwardStatistics.tsx
│   │   │   ├── RecruitmentCharts.tsx
│   │   │   └── ScoreStatistics.tsx
│   │   ├── forms/            # 表单组件（按模块组织）
│   │   │   ├── business/     # 业务表单组件
│   │   │   │   ├── AwardForm.tsx
│   │   │   │   ├── AwardGenerate.tsx
│   │   │   │   ├── AwardList.tsx
│   │   │   │   ├── RecruitmentForm.tsx
│   │   │   │   ├── RecruitmentList.tsx
│   │   │   │   ├── ScoreForm.tsx
│   │   │   │   └── ScoreList.tsx
│   │   │   └── employee/     # 员工相关表单
│   │   │       ├── EmployeeForm.tsx
│   │   │       └── EmployeeList.tsx
│   │   ├── layout/           # 布局组件
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   └── index.ts
│   │   └── ui/               # UI 基础组件（按功能组织）
│   │       ├── basic/        # 基础UI组件
│   │       │   ├── button.tsx
│   │       │   ├── badge.tsx
│   │       │   ├── card.tsx
│   │       │   ├── progress.tsx
│   │       │   ├── separator.tsx
│   │       │   ├── skeleton.tsx
│   │       │   └── loading-spinner.tsx
│   │       ├── form/         # 表单相关组件
│   │       │   ├── form.tsx
│   │       │   ├── input.tsx
│   │       │   ├── label.tsx
│   │       │   ├── select.tsx
│   │       │   ├── textarea.tsx
│   │       │   └── checkbox.tsx
│   │       ├── layout/       # 布局相关组件
│   │       │   ├── navigation-menu.tsx
│   │       │   ├── sidebar.tsx
│   │       │   ├── sheet.tsx
│   │       │   ├── tabs.tsx
│   │       │   └── table.tsx
│   │       └── interaction/  # 交互组件
│   │           ├── alert-dialog.tsx
│   │           ├── confirm-dialog.tsx
│   │           ├── dialog.tsx
│   │           ├── dropdown-menu.tsx
│   │           ├── tooltip.tsx
│   │           ├── password-verification.tsx
│   │           ├── certificate-template.tsx
│   │           ├── id-card-display.tsx
│   │           └── error-boundary.tsx
│   ├── constants/            # 常量定义
│   │   └── index.ts
│   ├── hooks/                # 自定义 Hooks
│   │   └── use-mobile.ts
│   ├── lib/                  # 工具库
│   │   ├── mongodb.ts        # 数据库连接
│   │   └── utils.ts          # 通用工具
│   ├── models/               # Mongoose 数据模型
│   │   ├── AnnualAward.ts
│   │   ├── Employee.ts
│   │   ├── RecruitmentRecord.ts
│   │   ├── ScoreRecord.ts
│   │   └── index.ts
│   ├── types/                # TypeScript 类型定义
│   │   └── index.ts
│   └── utils/                # 工具函数
│       ├── certificate.ts    # 证书生成工具
│       ├── export.ts         # 数据导出工具
│       ├── performance.ts    # 性能计算工具
│       └── index.ts
├── public/                   # 静态资源
│   ├── next.svg
│   ├── vercel.svg
│   └── *.svg                # 其他图标文件
├── package.json             # 项目依赖
├── package-lock.json        # 依赖锁定文件
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── next.config.ts          # Next.js 配置
├── vercel.json             # Vercel 部署配置
├── components.json         # Shadcn/ui 组件配置
├── CHANGELOG.md            # 更新日志
├── CONTRIBUTING.md         # 贡献指南
├── README-DEPLOYMENT.md    # 部署指南
└── LICENSE                 # 许可证
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

#### 数据修复接口
- `GET/POST /api/fix/recruitment-position` - 招聘岗位字段修复
- `POST /api/migrate/recruitment-position` - 招聘岗位字段迁移
- `GET /api/health` - 系统健康检查和诊断

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

## 🆕 最新更新特性

### v0.1.2 - 2025年9月16日最新版本

#### 🚀 重大功能更新

##### 📋 招聘管理全面增强
- **应聘岗位字段**：新增应聘岗位选择功能，与员工管理岗位保持一致
  - 支持9个标准岗位：销售主管、人事主管、运营主管、销售、运营、助理、客服、美工、未分配
  - 列表页面新增应聘岗位显示列，以Badge形式展示
  - 表单验证和数据库级别的完整支持
- **身份证号完全可选**：修复身份证号验证逻辑，真正实现可选填写
  - 前后端双重验证优化，空值时跳过格式验证
  - 支持灵活的招聘场景，无身份证也可正常提交
- **类型转换修复**：解决编辑时年龄字段类型不匹配问题
  - 前端表单自动处理数字到字符串的类型转换
  - 后端API支持混合类型输入，智能转换数据格式

##### 🛠️ 数据完整性保障
- **自动数据修复**：智能检测并修复缺失字段
  - 查询API自动为缺失appliedPosition字段的记录添加默认值
  - 更新API预处理，确保字段存在性
  - 强制修复API，使用MongoDB原生操作处理特殊情况
- **数据迁移支持**：平滑升级现有数据
  - 自动为历史记录添加新增字段
  - 保持数据一致性和完整性
  - 详细的迁移日志和验证机制

##### 🔍 开发调试优化
- **完整调试链路**：端到端的数据流追踪
  - 前端表单提交日志
  - 后端API请求处理日志
  - 数据库操作结果验证
  - 响应数据完整性检查
- **错误处理增强**：更好的问题诊断能力
  - 详细的Zod验证错误信息
  - 数据库操作失败的精确定位
  - 用户友好的错误提示

### v0.1.1 - 2025年9月11日版本

#### 🔧 架构优化
- **组件重构**：重新组织UI组件目录结构，提高代码可维护性
  - `src/components/ui/` 按功能分类为 `basic/`、`form/`、`layout/`、`interaction/`
  - `src/components/forms/` 按业务模块分类为 `employee/`、`business/`
- **代码质量**：严格遵循文件规模控制和目录结构规范
  - 动态语言文件 ≤ 200行，每个目录最多8个文件

#### 📋 招聘管理增强
- **年龄字段**：新增必填年龄字段，支持16-70岁范围验证
- **身份证优化**：身份证号改为可选字段，提升使用灵活性
- **表单改进**：修复React受控组件警告，提升用户体验
- **数据验证**：优化Zod schema验证，支持字符串到数字的智能转换

#### 🛠️ 技术修复
- **API优化**：修复Next.js 15的params异步访问问题
- **数据库优化**：修复Mongoose重复索引警告
- **数据迁移**：自动为现有记录添加默认年龄字段
- **类型安全**：完善TypeScript类型定义，减少运行时错误

#### 🔍 调试支持
- **调试日志**：完善的前后端调试日志系统
- **错误处理**：优化错误边界和异常处理机制
- **开发体验**：提供详细的调试信息和错误追踪

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
1. 查看 `src/components/ui/interaction/password-verification.tsx` 文件中的密码设置
2. 或者重新设置新的密码
3. 建议将密码记录在安全的地方

### Q: 更新记录时没有反应或日志没有输出？
A: 这通常是前端缓存或网络请求问题：
1. **强制刷新页面**：按 `Ctrl + F5` (Windows) 或 `Cmd + Shift + R` (Mac)
2. **清除浏览器缓存**：在开发者工具中右键刷新按钮，选择"清空缓存并硬性重新加载"
3. **检查控制台**：按 `F12` 打开开发者工具，查看Console和Network标签页
4. **重启开发服务器**：在终端中按 `Ctrl + C` 停止服务器，然后重新运行 `npm run dev`

### Q: React受控组件警告如何解决？
A: 这个问题已经在最新版本中修复：
1. 确保表单的 `defaultValues` 使用空字符串 `''` 而不是 `undefined`
2. 数字字段在表单中使用字符串类型，在提交时转换为数字
3. 如果问题仍然存在，检查表单组件中的 `onChange` 处理器

### Q: 年龄字段不显示的问题？
A: 这个问题已经修复，如果仍然遇到：
1. 检查数据库中是否有age字段：访问 `/api/recruitment` 查看API返回数据
2. 清除浏览器缓存并强制刷新页面
3. 现有记录会自动添加默认年龄25岁，可以手动编辑更正

### Q: 应聘岗位更新后不显示的问题？
A: 这通常是由于历史数据缺少新字段导致的：
1. **自动修复**：刷新招聘记录列表页面，系统会自动检测并修复缺失字段
2. **手动修复**：如果自动修复失败，可以执行强制修复：
   ```javascript
   // 在浏览器控制台执行
   fetch('/api/fix/recruitment-position', {method: 'POST'})
     .then(res => res.json()).then(console.log);
   ```
3. **验证修复**：查看服务器日志确认 `appliedPosition` 字段已正确添加
4. **重新编辑**：修复完成后重新编辑招聘记录，应聘岗位应能正常更新和显示

### Q: 身份证号无法为空的问题？
A: 最新版本已完全支持身份证号可选：
1. **前端验证**：空值时会跳过格式验证，不会报错
2. **后端处理**：API支持空值和有效身份证号两种情况
3. **数据库存储**：使用稀疏索引，允许空值存在
4. **如果仍有问题**：清除浏览器缓存并刷新页面

### Q: API请求失败或超时？
A: 检查以下几点：
1. **MongoDB连接**：确保MongoDB服务正在运行
2. **环境变量**：检查 `.env.local` 中的 `MONGODB_URI` 配置
3. **端口冲突**：确保3000端口没有被其他程序占用
4. **网络问题**：检查防火墙设置和网络连接

### Q: 生产环境部署问题？
A: 参考以下步骤：
1. 确保所有环境变量在Vercel中正确配置
2. 检查 `vercel.json` 配置文件
3. 查看部署日志中的错误信息
4. 确保MongoDB数据库允许外部连接

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
