// 飞书知识库批量同步 API

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getFeishuTenantAccessToken } from '@/lib/feishu';
import { addToQueue } from '@/lib/queue';
import { processFeishuDocument } from '@/lib/processor';

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

    // 获取云空间根目录下的文件
    const response = await fetch(
      'https://open.feishu.cn/open-apis/drive/v1/files?folder_token=&order_by=EditedTime&direction=DESC&page_size=100',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`获取文件列表失败: ${data.msg}`);
    }

    // 过滤出文档类型文件
    const files = (data.data?.files || [])
      .filter((file: { type: string }) =>
        file.type === 'docx' || file.type === 'doc'
      )
      .map((file: { token: string; name: string; type: string; edited_time: string }) => ({
        id: file.token,
        name: file.name,
        type: file.type,
        editedTime: file.edited_time,
      }));

    return NextResponse.json({
      success: true,
      files,
      total: files.length,
    });
  } catch (error) {
    console.error('获取飞书文件列表错误:', error);
    return NextResponse.json(
      { error: (error as Error).message || '获取文件列表失败' },
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

    // 获取云空间根目录下的文件
    const response = await fetch(
      'https://open.feishu.cn/open-apis/drive/v1/files?folder_token=&order_by=EditedTime&direction=DESC&page_size=100',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`获取文件列表失败: ${data.msg}`);
    }

    // 过滤出文档类型文件
    const files = (data.data?.files || [])
      .filter((file: { type: string }) =>
        file.type === 'docx' || file.type === 'doc'
      );

    console.log(`找到 ${files.length} 个文档，开始批量同步...`);

    // 添加到队列
    const results = [];
    for (const file of files) {
      const fileId = file.token;
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
        status: 'queued',
      });
    }

    return NextResponse.json({
      success: true,
      message: `已将 ${files.length} 个文档加入处理队列`,
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
