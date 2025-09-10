# 🚀 Vercel 部署指南

## 部署前准备

### 1. 数据库准备
- **推荐使用 MongoDB Atlas**（免费层足够开发使用）
- 或者其他云MongoDB服务（如阿里云、腾讯云等）

### 2. 获取数据库连接字符串
```
mongodb+srv://username:password@cluster.mongodb.net/hr-management?retryWrites=true&w=majority
```

## 🔧 Vercel 部署步骤

### 方法一：通过 Vercel CLI

1. **安装 Vercel CLI**
```bash
npm i -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
vercel
```

4. **设置环境变量**
```bash
vercel env add MONGODB_URI
# 输入你的MongoDB连接字符串
```

### 方法二：通过 Vercel 网站

1. **访问 [vercel.com](https://vercel.com)**

2. **连接 GitHub 仓库**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库：`XUXIKAI886/renshiguanlixitong`

3. **配置环境变量**
   在部署设置中添加：
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/hr-management
   NODE_ENV = production
   ```

4. **部署设置**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## 🌍 环境变量配置

### 必需的环境变量：
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hr-management
NODE_ENV=production
```

### 可选的环境变量：
```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
OPERATION_PASSWORD=your-custom-password
```

## 📋 部署后验证

### 1. 检查系统状态
访问：`https://your-domain.vercel.app/api/health`

### 2. 测试主要功能
- ✅ 主页加载
- ✅ 员工管理
- ✅ 招聘管理
- ✅ 积分管理
- ✅ 年度评优

## 🛠️ 故障排除

### 常见问题：

1. **数据库连接失败**
   - 检查 MONGODB_URI 是否正确
   - 确认数据库网络访问权限

2. **构建失败**
   - 检查依赖是否完整
   - 查看构建日志

3. **API 超时**
   - 检查数据库响应时间
   - 优化查询性能

### 查看日志：
```bash
vercel logs your-deployment-url
```

## 🔒 安全建议

1. **修改默认密码**
   - 生产环境中修改默认操作密码 `csch903`

2. **数据库安全**
   - 使用强密码
   - 限制数据库访问IP
   - 启用数据库审计

3. **环境变量**
   - 不要在代码中硬编码敏感信息
   - 使用 Vercel 环境变量管理

## 📊 性能优化

1. **启用 Edge Functions**（如需要）
2. **配置 CDN 缓存**
3. **数据库索引优化**
4. **图片优化**

## 🆙 更新部署

### 自动部署：
- 推送到 main 分支会自动触发部署

### 手动部署：
```bash
vercel --prod
```

## 📞 支持

如有问题，请查看：
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- 项目 Issues：https://github.com/XUXIKAI886/renshiguanlixitong/issues
