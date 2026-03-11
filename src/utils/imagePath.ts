/**
 * 获取图片资源的完整路径
 * 在 GitHub Pages 部署时，需要包含基础路径
 */
export function getImagePath(path: string): string {
  // 移除开头的斜杠（如果有）
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  // 返回完整路径
  return `/rsw_drama/${cleanPath}`
}
