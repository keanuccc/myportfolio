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
/**
 * 获取飞书文档内容
 * @param documentId 文档 ID 或 node_token
 * @param userAccessToken 可选的用户访问令牌，如果提供则使用用户令牌
 */
export async function getFeishuDocumentContent(
  documentId: string,
  userAccessToken?: string
): Promise<FeishuDocument> {
  // 优先使用 userAccessToken，否则使用 tenant_access_token
  const token = userAccessToken || await getFeishuTenantAccessToken();

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
 * 获取飞书 OAuth 授权 URL
 */
export function getFeishuAuthUrl(redirectUri: string): string {
  const appId = process.env.FEISHU_APP_ID;
  if (!appId) {
    throw new Error('FEISHU_APP_ID 未配置');
  }

  const params = new URLSearchParams({
    app_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state: 'feishu_sync',  // 用于验证回调
    // 指定需要的权限范围（云文档 + 知识库）
    scope: 'drive:drive:readonly wiki:wiki:readonly',
  });

  return `https://open.feishu.cn/open-apis/authen/v1/authorize?${params.toString()}`;
}

/**
 * 使用授权码获取 user_access_token
 */
export async function getFeishuUserAccessToken(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('飞书应用凭证未配置');
  }

  // 先获取 app_access_token
  const appTokenResponse = await fetch(
    'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );

  const appTokenData = await appTokenResponse.json();
  if (appTokenData.code !== 0) {
    throw new Error(`获取 app_access_token 失败: ${appTokenData.msg}`);
  }

  // 使用授权码获取 user_access_token
  const response = await fetch(
    'https://open.feishu.cn/open-apis/authen/v1/oidc/access_token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appTokenData.app_access_token}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
      }),
    }
  );

  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`获取 user_access_token 失败: ${data.msg}`);
  }

  return {
    accessToken: data.data.access_token,
    refreshToken: data.data.refresh_token,
    expiresIn: data.data.expires_in,
  };
}

/**
 * 获取知识库列表
 */
async function getWikiSpaces(token: string): Promise<{ spaceId: string; name: string }[]> {
  const response = await fetch(
    'https://open.feishu.cn/open-apis/wiki/v2/spaces?page_size=50',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    console.error('获取知识库列表失败:', response.status);
    return [];
  }

  const data = await response.json();
  if (data.code !== 0) {
    console.error('获取知识库列表失败:', data.msg);
    return [];
  }

  return (data.data?.items || []).map((item: { space_id: string; name: string }) => ({
    spaceId: item.space_id,
    name: item.name,
  }));
}

/**
 * 获取知识库节点列表（递归获取所有文档）
 */
async function getWikiNodes(
  token: string,
  spaceId: string,
  parentNodeToken?: string
): Promise<FeishuDocumentItem[]> {
  const params = new URLSearchParams({
    page_size: '50',
  });
  if (parentNodeToken) {
    params.set('parent_node_token', parentNodeToken);
  }

  const response = await fetch(
    `https://open.feishu.cn/open-apis/wiki/v2/spaces/${spaceId}/nodes?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    console.error(`获取知识库节点失败: ${spaceId}`, response.status);
    return [];
  }

  const data = await response.json();
  if (data.code !== 0) {
    console.error(`获取知识库节点失败: ${spaceId}`, data.msg);
    return [];
  }

  const nodes: FeishuDocumentItem[] = [];
  const items = data.data?.items || [];

  for (const item of items) {
    // 只获取文档类型（docx）的节点
    if (item.obj_type === 'docx' || item.obj_type === 'doc') {
      nodes.push({
        id: item.node_token,
        title: item.title || '未命名文档',
        updateTime: item.obj_edit_time || '',
        size: 0,
      });
    }

    // 递归获取子节点
    if (item.has_child) {
      const childNodes = await getWikiNodes(token, spaceId, item.node_token);
      nodes.push(...childNodes);
    }
  }

  return nodes;
}

/**
 * 获取飞书文档列表（使用 user_access_token）
 * 同时获取云文档和知识库文档
 */
export async function getFeishuDocumentList(
  userAccessToken: string,
  pageSize: number = 200,
  pageToken?: string
): Promise<{
  documents: FeishuDocumentItem[];
  hasMore: boolean;
  pageToken?: string;
}> {
  const allDocuments: FeishuDocumentItem[] = [];

  // 1. 获取云文档
  try {
    const params = new URLSearchParams({
      page_size: pageSize.toString(),
      order_by: 'EditedTime',
      direction: 'DESC',
    });
    if (pageToken) {
      params.set('page_token', pageToken);
    }

    const driveResponse = await fetch(
      `https://open.feishu.cn/open-apis/drive/v1/files?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (driveResponse.ok) {
      const driveData = await driveResponse.json();
      if (driveData.code === 0) {
        const driveFiles = (driveData.data?.files || [])
          .filter((item: { type: string }) => item.type === 'docx' || item.type === 'doc')
          .map((item: { token: string; name: string; modified_time?: string; size?: number }) => ({
            id: item.token,
            title: item.name || '未命名文档',
            updateTime: item.modified_time || '',
            size: item.size || 0,
          }));
        allDocuments.push(...driveFiles);
      }
    }
  } catch (err) {
    console.error('获取云文档失败:', err);
  }

  // 2. 获取知识库文档
  try {
    const spaces = await getWikiSpaces(userAccessToken);
    for (const space of spaces) {
      const wikiNodes = await getWikiNodes(userAccessToken, space.spaceId);
      allDocuments.push(...wikiNodes);
    }
  } catch (err) {
    console.error('获取知识库文档失败:', err);
  }

  // 去重（根据 id）
  const uniqueDocuments = allDocuments.filter(
    (doc, index, self) => index === self.findIndex(d => d.id === doc.id)
  );

  return {
    documents: uniqueDocuments,
    hasMore: false,  // 已经获取了所有文档
    pageToken: undefined,
  };
}
