// 飞书 API 服务

interface FeishuDocumentItem {
  id: string;
  title: string;
  updateTime: string;
  size: number;
}

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

  // 调试日志
  console.log('环境变量检查:', {
    FEISHU_APP_ID: appId ? `${appId.substring(0, 8)}...` : '未设置',
    FEISHU_APP_ID_LENGTH: appId?.length || 0,
    FEISHU_APP_SECRET: appSecret ? '已设置' : '未设置',
    FEISHU_APP_SECRET_LENGTH: appSecret?.length || 0,
  });

  if (!appId || !appSecret) {
    throw new Error(`飞书应用凭证未配置。FEISHU_APP_ID: ${appId ? '已设置' : '未设置'}, FEISHU_APP_SECRET: ${appSecret ? '已设置' : '未设置'}`);
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
 * 判断是否是 wiki 文档
 */
function isWikiDocument(documentId: string): boolean {
  // Wiki 文档的 token 通常以大写字母开头，长度较长
  return /^[A-Z][a-zA-Z0-9]{20,}$/.test(documentId);
}

/**
 * 获取 wiki 文档的实际 document_id
 */
async function getWikiDocumentId(wikiToken: string, token: string): Promise<string> {
  const response = await fetch(
    `https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token=${wikiToken}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (data.code !== 0) {
    const hint = data.code === 99991663
      ? '。请在飞书开放平台为应用添加 wiki:wiki:readonly 权限，并在文档中添加应用为协作者'
      : '';
    throw new Error(`获取 wiki 节点信息失败: ${data.msg} (code: ${data.code})${hint}`);
  }

  // 返回 obj_token 作为实际的 document_id
  return data.data?.node?.obj_token || wikiToken;
}

/**
 * 获取飞书文档内容
 */
export async function getFeishuDocumentContent(documentId: string): Promise<FeishuDocument> {
  const token = await getFeishuTenantAccessToken();

  let actualDocId = documentId;

  // 如果是 wiki 文档，先获取实际的 document_id
  if (isWikiDocument(documentId)) {
    console.log('检测到 wiki 文档，正在获取实际文档 ID...');
    actualDocId = await getWikiDocumentId(documentId, token);
    console.log('实际文档 ID:', actualDocId);
  }

  // 获取文档元信息
  const metaResponse = await fetch(
    `https://open.feishu.cn/open-apis/docx/v1/documents/${actualDocId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const metaData = await metaResponse.json();

  if (metaData.code !== 0) {
    const hint = metaData.code === 99991663
      ? '。请在飞书开放平台为应用添加 docx:document:readonly 权限，并在文档中添加应用为协作者'
      : '';
    throw new Error(`获取文档信息失败: ${metaData.msg} (code: ${metaData.code})${hint}`);
  }

  // 获取文档纯文本内容
  const contentResponse = await fetch(
    `https://open.feishu.cn/open-apis/docx/v1/documents/${actualDocId}/raw_content`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const contentData = await contentResponse.json();

  if (contentData.code !== 0) {
    throw new Error(`获取文档内容失败: ${contentData.msg} (code: ${contentData.code})`);
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

/**
 * 获取飞书文档列表
 */
export async function getFeishuDocumentList(
  pageSize: number = 50,
  pageToken?: string
): Promise<{
  documents: FeishuDocumentItem[];
  hasMore: boolean;
  pageToken?: string;
}> {
  const token = await getFeishuTenantAccessToken();

  // 构建查询参数
  const params = new URLSearchParams({
    page_size: pageSize.toString(),
  });
  if (pageToken) {
    params.set('page_token', pageToken);
  }

  // 调用飞书 API 获取文档列表（使用云文档列表 API）
  const response = await fetch(
    `https://open.feishu.cn/open-apis/drive/v1/files?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // 先检查 HTTP 状态码
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP 错误: ${response.status} ${response.statusText} - ${text.substring(0, 200)}`);
  }

  // 再解析 JSON
  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`获取文档列表失败: ${data.msg} (code: ${data.code})`);
  }

  return {
    documents: (data.data?.files || []).map((item: { token: string; name: string; type: string; modified_time?: string; size?: number }) => ({
      id: item.token,
      title: item.name || '未命名文档',
      updateTime: item.modified_time || '',
      size: item.size || 0,
    })),
    hasMore: data.data?.has_more || false,
    pageToken: data.data?.page_token,
  };
}
