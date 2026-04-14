import type { Literature } from '../types/literatureTypes';

export const literatureData: Literature[] = [
  {
    id: '1',
    title: '西南剧展史论',
    author: '张骏祥',
    year: 1944,
    description: '西南剧展的历史回顾与理论分析',
    category: '史论',
    ossKey: 'method.pdf',
    fileName: 'method.pdf',
    fileSize: 0,
    mimeType: 'application/pdf',
    uploadDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
    viewCount: 0,
    downloadCount: 0,
    imageUrl: '',
    urls: {
      public: 'http://example.com/method.pdf',
      read: 'http://example.com/method.pdf',
      download: 'http://example.com/method.pdf'
    }
  },
  {
    id: '2',
    title: '戏剧与社会',
    author: '曹禺',
    year: 1943,
    description: '探讨戏剧与社会的关系',
    category: '理论',
    ossKey: 'literature2.pdf',
    fileName: 'literature2.pdf',
    fileSize: 0,
    mimeType: 'application/pdf',
    uploadDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
    viewCount: 0,
    downloadCount: 0,
    imageUrl: '',
    urls: {
      public: 'https://example.com/literature2.pdf',
      read: 'https://example.com/literature2.pdf',
      download: 'https://example.com/literature2.pdf'
    }
  },
  {
    id: '3',
    title: '抗战戏剧运动',
    author: '余上沅',
    year: 1942,
    description: '抗战时期的戏剧运动研究',
    category: '历史',
    ossKey: 'literature3.pdf',
    fileName: 'literature3.pdf',
    fileSize: 0,
    mimeType: 'application/pdf',
    uploadDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
    viewCount: 0,
    downloadCount: 0,
    imageUrl: '',
    urls: {
      public: 'https://example.com/literature3.pdf',
      read: 'https://example.com/literature3.pdf',
      download: 'https://example.com/literature3.pdf'
    }
  },
  {
    id:'4',
    title:'小人物狂想曲',
    author:'沈浮',
    year: 1945,
    description: '探讨小人物在历史中的作用',
    category: '戏剧',
    ossKey: 'literature4.pdf',
    fileName: 'literature4.pdf',
    fileSize: 0,
    mimeType: 'application/pdf',
    uploadDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
    viewCount: 0,
    downloadCount: 0,
    imageUrl: '',
    urls: {
      public: 'https://example.com/literature4.pdf',
      read: 'https://example.com/literature4.pdf',
      download: 'https://example.com/literature4.pdf'
    }
  },
];
