import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { logVisit, getLogs, getStats } from './controllers/visit.controller.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 配置静态资源
app.use(express.static(path.join(__dirname, '../public')));

// 记录访问路由
app.get('/v', logVisit);

// 获取日志路由
app.get('/api/logs', getLogs);

// 获取统计数据路由
app.get('/api/stats', getStats);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}/v`);
  console.log(`Logs: http://localhost:${PORT}/api/logs`);
});

export default app;
