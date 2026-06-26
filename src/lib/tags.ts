// 中文停用词列表
const STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '他', '她', '它', '们', '那', '被', '从', '把', '让', '用', '对',
  '与', '以', '但', '而', '如', '或', '之', '其', '此', '这些', '那些', '什么',
]);

/**
 * 从文本中提取关键词标签
 * - 分词（中文按字符，英文按空格）
 * - 过滤停用词
 * - 统计词频
 * - 取前 N 个高频词作为标签
 */
export function extractTags(content: string, maxTags: number = 5): string[] {
  if (!content) return [];

  // 提取中文词汇（2-4个字符）
  const chineseWords = content.match(/[一-龥]{2,4}/g) || [];

  // 提取英文词汇
  const englishWords = content.match(/[a-zA-Z]{3,}/g) || [];

  // 合并所有词汇
  const allWords = [...chineseWords, ...englishWords.map(w => w.toLowerCase())];

  // 过滤停用词和短词
  const filteredWords = allWords.filter(
    word => word.length >= 2 && !STOP_WORDS.has(word)
  );

  // 统计词频
  const wordCount = new Map<string, number>();
  for (const word of filteredWords) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }

  // 按词频排序，取前 N 个
  const sortedWords = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTags)
    .map(([word]) => word);

  return sortedWords;
}
