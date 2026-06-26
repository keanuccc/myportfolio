export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  feishuDocId?: string;  // 飞书文档 ID，用于判断是否已同步
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  hero: {
    name: string;
    title: string;
    subtitle: string;
  };
  whoami: {
    bio: string;
    avatar?: string;
    skills: string[];
  };
  contact: {
    email: string;
    socialLinks: { platform: string; url: string }[];
  };
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface FeishuDocumentItem {
  id: string;           // 飞书文档 ID
  title: string;        // 文档标题
  updateTime: string;   // 更新时间
  size: number;         // 文档大小（字节）
}

export interface SyncResult {
  synced: number;       // 成功同步数量
  skipped: number;      // 跳过数量
  errors: string[];     // 错误信息列表
}
