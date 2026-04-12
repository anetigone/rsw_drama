import type { Literature } from '../types/literatureTypes';

export const literatureData: Literature[] = [
  {
    id: '1',
    title: '西南剧展史论',
    author: '张骏祥',
    year: 1944,
    description: '西南剧展的历史回顾与理论分析',
    source: '/method.pdf',
    category: '史论'
  },
  {
    id: '2',
    title: '戏剧与社会',
    author: '曹禺',
    year: 1943,
    description: '探讨戏剧与社会的关系',
    source: 'https://example.com/literature2.pdf',
    category: '理论'
  },
  {
    id: '3',
    title: '抗战戏剧运动',
    author: '余上沅',
    year: 1942,
    description: '抗战时期的戏剧运动研究',
    source: 'https://example.com/literature3.pdf',
    category: '历史'
  },
  {
    id:'4',
    title:'小人物狂想曲',
    author:'沈浮',
    year: 1945,
    description: '探讨小人物在历史中的作用',
    source: 'https://example.com/literature4.pdf',
    category: '戏剧'
  },
];
