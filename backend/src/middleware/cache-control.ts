import { Request, Response, NextFunction } from 'express';

/**
 * 防止 CDN 和浏览器缓存 API 响应
 * 适用于动态数据 API
 */
export function noCache(req: Request, res: Response, next: NextFunction) {
  // 设置缓存控制头，防止 CDN 和浏览器缓存
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

/**
 * 允许短期缓存（适用于静态资源或不经常变化的数据）
 * @param maxAge 最大缓存时间（秒）
 */
export function shortCache(maxAge: number = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
}

/**
 * 允许长期缓存（适用于静态资源）
 * @param maxAge 最大缓存时间（秒）
 */
export function longCache(maxAge: number = 31536000) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
    next();
  };
}
