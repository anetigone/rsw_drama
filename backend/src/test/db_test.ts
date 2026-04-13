import {prisma} from '../config/database';
import { AppError } from '../middleware/error.handler';
import { LiteratureQuery, LiteratureCreateInput, LiteratureUpdateInput } from '../types';
import logger from '../utils/logger';
import literatureService from '../services/literature.service';

literatureService.createLiterature({
    title: '测试文献',
    author: 'Test Author',
    year: 2023,
    category: 'Test Category',
    ossKey: 'test-oss-key',
    fileName: 'test-file.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
}).then(literature => {
    console.log('Created literature:', literature);
})

literatureService.getLiteratures({
    page: 1,
    pageSize: 10,
    category: 'Test Category',
}).then(result => {
    console.log('Literature list:', result);
})