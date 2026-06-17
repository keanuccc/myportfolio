// 飞书知识库批量同步 API

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getFeishuTenantAccessToken } from '@/lib/feishu';
import { addToQueue } from '@/lib/queue';
import { processFeishuDocument } from '@/lib/processor';

interface WikiNode {
  node_token: string;
  obj_token: string;
  obj_type: string;
  title: string;
  has_child: boolean;
}

/**
 * 获取知识库空间列表
 */
async function getWikiSpaces(token: string) {
  const response = await fetch(
    'https://open.feishu.cn/open-apis/wiki/v2/spaces?page_size=50',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`获取知识库空间失败: ${data.msg}`);
  }

  return data.data?.items || [];
}

/**
 * 获取知识库节点列表（递归获取所有文档）
 */
async function getWikiNodes(token: string, spaceId: string, parentNodeToken?: string): Promise<WikiNode[]> {
  const url = parentNodeToken
    ? `https://open.feishu.cn/open-apis/wiki/v2/spaces/${spaceId}/nodes?parent_node_token=${parentNodeToken}&page_size=50`
    : `https://open.feishu.cn/open-apis/wiki/v2/spaces/${spaceId}/nodes?page_size=50`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (data.code !== 0) {
    console.error(`获取节点失败: ${data.msg}`);
    return [];
  }

  const nodes: WikiNode[] = data.data?.items || [];

  // 递归获取子节点
  const allNodes: WikiNode[] = [...nodes];
  for (const node of nodes) {
    if (node.has_child) {
      const childNodes = await getWikiNodes(token, spaceId, node.node_token);
      allNodes.push(...childNodes);
    }
  }

  return allNodes;
}

/**
 * GET /api/feishu/sync-all
 * 获取飞书知识库中的所有文档
 */
export async function GET(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = await getFeishuTenantAccessToken();

    // 获取知识库空间列表
    const spaces = await getWikiSpaces(token);
    console.log(`找到 ${spaces.length} 个知识库空间`);

    // 获取所有空间中的文档
    const allFiles: Array<{ id: string; name: string; type: string; spaceName: string }> = [];

    for (const space of spaces) {
      const spaceId = space.space_id;
      const spaceName = space.name;

      console.log(`正在获取知识库: ${spaceName}`);

      const nodes = await getWikiNodes(token, spaceId);

      for (const node of nodes) {
        // 只处理文档类型 (doc, docx)
        if (node.obj_type === 'doc' || node.obj_type === 'docx') {
          allFiles.push({
            id: node.obj_token,
            name: node.title,
            type: node.obj_type,
            spaceName: spaceName,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      files: allFiles,
      total: allFiles.length,
      spaces: spaces.length,
    });
  } catch (error) {
    console.error('获取飞书文档列表错误:', error);
    return NextResponse.json(
      { error: (error as Error).message || '获取文档列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feishu/sync-all
 * 批量同步所有文档
 */
export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = await getFeishuTenantAccessToken();

    // 获取知识库空间列表
    const spaces = await getWikiSpaces(token);
    console.log(`找到 ${spaces.length} 个知识库空间`);

    // 获取所有空间中的文档
    const allFiles: Array<{ id: string; name: string; type: string; spaceName: string }> = [];

    for (const space of spaces) {
      const spaceId = space.space_id;
      const spaceName = space.name;

      console.log(`正在获取知识库: ${spaceName}`);

      const nodes = await getWikiNodes(token, spaceId);

      for (const node of nodes) {
        // 只处理文档类型 (doc, docx)
        if (node.obj_type === 'doc' || node.obj_type === 'docx') {
          allFiles.push({
            id: node.obj_token,
            name: node.title,
            type: node.obj_type,
            spaceName: spaceName,
          });
        }
      }
    }

    console.log(`找到 ${allFiles.length} 个文档，开始批量同步...`);

    if (allFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有找到可同步的文档',
        files: [],
      });
    }

    // 添加到队列并异步处理
    const results = [];
    for (const file of allFiles) {
      const fileId = file.id;
      const fileName = file.name;

      // 添加到处理队列
      await addToQueue(fileId, fileName);

      // 异步处理文档
      processFeishuDocument(fileId, false)
        .then((result) => {
          if (result.success) {
            console.log(`✓ ${fileName} 同步成功`);
          } else {
            console.error(`✗ ${fileName} 同步失败: ${result.error}`);
          }
        })
        .catch((error) => {
          console.error(`✗ ${fileName} 处理错误:`, error);
        });

      results.push({
        id: fileId,
        name: fileName,
        spaceName: file.spaceName,
        status: 'queued',
      });
    }

    return NextResponse.json({
      success: true,
      message: `已将 ${allFiles.length} 个文档加入处理队列`,
      files: results,
    });
  } catch (error) {
    console.error('批量同步错误:', error);
    return NextResponse.json(
      { error: (error as Error).message || '批量同步失败' },
      { status: 500 }
    );
  }
}
