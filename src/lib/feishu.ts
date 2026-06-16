interface FeishuDocument {
  document_id: string;
  title: string;
  content: string;
}

// 获取飞书 tenant_access_token
export async function getFeishuTenantAccessToken(): Promise<string> {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Feishu app credentials not configured');
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
    throw new Error(`Failed to get tenant access token: ${data.msg}`);
  }

  return data.tenant_access_token;
}

// 获取飞书文档内容
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
    throw new Error(`Failed to fetch document meta: ${metaData.msg}`);
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
    throw new Error(`Failed to fetch document content: ${contentData.msg}`);
  }

  return {
    document_id: documentId,
    title: metaData.data?.document?.title || 'Untitled',
    content: contentData.data?.content || '',
  };
}

// 验证飞书 Webhook 请求
export function verifyFeishuWebhook(token: string): boolean {
  const verificationToken = process.env.FEISHU_VERIFICATION_TOKEN;
  return token === verificationToken;
}

// 解析飞书事件
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
