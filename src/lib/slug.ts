import { pinyin } from 'pinyin-pro';

/**
 * 将标题转换为 URL 友好的 slug
 * - 中文标题转拼音
 * - 英文标题转小写
 * - 特殊字符替换为连字符
 */
export function generateSlug(title: string): string {
  if (!title) return 'untitled';

  // 中文转拼音
  const pinyinText = pinyin(title, {
    toneType: 'none',
    type: 'array',
  }).join('');

  // 转小写，特殊字符替换为连字符
  const slug = pinyinText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'untitled';
}

/**
 * 检查 slug 是否已存在，如果存在则添加数字后缀
 */
export function ensureUniqueSlug(slug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(slug)) {
    return slug;
  }

  let counter = 2;
  let newSlug = `${slug}-${counter}`;

  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${slug}-${counter}`;
  }

  return newSlug;
}
