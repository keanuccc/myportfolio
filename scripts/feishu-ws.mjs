/**
 * 飞书长连接事件监听脚本
 *
 * 使用方法：
 * 1. 确保 .env.local 中配置了 FEISHU_APP_ID 和 FEISHU_APP_SECRET
 * 2. 运行：node scripts/feishu-ws.mjs
 *
 * 这个脚本会通过 WebSocket 长连接接收飞书事件，无需配置 Webhook URL
 */

import * as Lark from '@larksuiteoapi/node-sdk';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;

if (!APP_ID || !APP_SECRET) {
  console.error('错误：请在 .env.local 中配置 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
  process.exit(1);
}

console.log('========================================');
console.log('飞书长连接事件监听器');
console.log('========================================');
console.log(`App ID: ${APP_ID.substring(0, 8)}...`);
console.log('');

// Vercel API 地址
const VERCEL_API_URL = 'https://myportfolio-tau-coral-89.vercel.app/api/feishu/process';

// 创建事件处理器
const eventDispatcher = new Lark.EventDispatcher({});

// 注册文档编辑事件
eventDispatcher.register({
  'drive.file.edit_v1': async (data) => {
    console.log('\n----------------------------------------');
    console.log('收到文档编辑事件');
    console.log('----------------------------------------');

    const fileToken = data?.event?.file_token;
    const fileName = data?.event?.file_name || '未命名文档';
    const operatorId = data?.event?.operator_id;

    console.log(`文档名称: ${fileName}`);
    console.log(`文档 ID: ${fileToken}`);
    console.log(`操作者: ${operatorId}`);
    console.log('');

    if (fileToken) {
      // 调用 Vercel API 处理文档
      console.log('正在调用 API 处理文档...');
      try {
        const response = await fetch(VERCEL_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: fileToken,
            documentTitle: fileName,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log('✓ 文档处理成功');
          if (result.blogPostId) {
            console.log(`  博客文章 ID: ${result.blogPostId}`);
          }
        } else {
          console.error('✗ 文档处理失败:', result.error);
        }
      } catch (error) {
        console.error('✗ API 调用失败:', error.message);
      }
    }

    console.log('----------------------------------------\n');
  },
});

// 创建 WebSocket 客户端
const wsClient = new Lark.WSClient({
  appId: APP_ID,
  appSecret: APP_SECRET,
  loggerLevel: Lark.LoggerLevel.info,
});

// 启动长连接
console.log('正在建立长连接...');
console.log('');

wsClient.start({
  eventDispatcher,
}).then(() => {
  console.log('✓ 长连接已建立');
  console.log('');
  console.log('等待飞书事件...');
  console.log('（按 Ctrl+C 退出）');
  console.log('');
}).catch((error) => {
  console.error('长连接失败:', error);
  process.exit(1);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n正在断开连接...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n正在断开连接...');
  process.exit(0);
});
