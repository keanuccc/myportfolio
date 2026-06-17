// 飞书 API 服务

interface FeishuDocument {
  documentId: string;
  title: string;
  content: string;
}

// 缓存 tenant_access_token
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * 获取飞书 tenant_access_token
 */
export async function getFeishuTenantAccessToken(): Promise<string> {
  // 检查缓存是否有效
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('飞书应用凭证未配置。请检查 FEISHU_APP_ID 和 FEISHU_APP_SECRET 环境变量。');
  }

  const response = await fetch(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`获取飞书访问令牌失败: ${data.msg}`);
  }

  // 缓存 token，提前 5 分钟过期
  cachedToken = data.tenant_access_token;
  tokenExpiry = Date.now() + (data.expire - 300) * 1000;

  return cachedToken as string;
}

/**
 * 从飞书文档链接中提取文档 ID
 */
export function extractDocumentId(url: string): string | null {
  // 支持多种飞书文档链接格式
  const patterns = [
    /\/docx\/([a-zA-Z0-9]+)/,
    /\/docs\/([a-zA-Z0-9]+)/,
    /\/wiki\/([a-zA-Z0-9]+)/,
    /\/sheets\/([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // 如果直接输入的是文档 ID
  if (/^[a-zA-Z0-9]+$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * 获取飞书文档内容
 */
export async function getFeishuDocumentContent(documentId: string): Promise<FeishuDocument> {
  const token = await getFeishuTenantAccessToken();

  // 获取文档元信息
  const metaResponse = await fetch(
    `https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const metaData = await metaResponse.json();

  if (metaData.code !== 0) {
    throw new Error(`获取文档信息失败: ${metaData.msg}`);
  }

  // 获取文档纯文本内容
  const contentResponse = await fetch(
    `https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}/raw_content`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const contentData = await contentResponse.json();

  if (contentData.code !== 0) {
    throw new Error(`获取文档内容失败: ${contentData.msg}`);
  }

  return {
    documentId,
    title: metaData.data?.document?.title || '未命名文档',
    content: contentData.data?.content || '',
  };
}

/**
 * 验证飞书 Webhook 请求
 */
export function verifyFeishuWebhook(token: string): boolean {
  const verificationToken = process.env.FEISHU_VERIFICATION_TOKEN;
  return token === verificationToken;
}

/**
 * 飞书 Webhook 事件类型
 */
export interface FeishuWebhookEvent {
  schema?: string;
  header: {
    event_id: string;
    event_type: string;
    create_time: string;
    token: string;
    app_id: string;
    tenant_key: string;
  };
  event: Record<string, unknown>;
}

/**
 * 解析飞书事件
 */
export function parseFeishuEvent(body: unknown): FeishuWebhookEvent | null {
  try {
    const event = body as FeishuWebhookEvent;
    if (event.header && event.header.event_type) {
      return event;
    }
    return null;
  } catch {
    return null;
  }
}
