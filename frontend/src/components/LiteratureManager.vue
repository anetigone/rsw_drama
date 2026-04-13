<template>
  <div class="literature-manager">
    <div class="header">
      <h2>文献管理</h2>
      <div class="actions">
        <el-button type="primary" @click="openUploadDialog">
          <el-icon><Upload /></el-icon>
          上传文献
        </el-button>
        <el-button @click="loadLiteratures">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索标题或描述"
            clearable
            @change="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="selectedCategory"
            placeholder="选择分类"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.name"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="sortBy" placeholder="排序方式" @change="handleSearch">
            <el-option label="上传日期" value="uploadDate" />
            <el-option label="浏览次数" value="viewCount" />
            <el-option label="标题" value="title" />
            <el-option label="年份" value="year" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="sortOrder" placeholder="排序" @change="handleSearch">
            <el-option label="降序" value="desc" />
            <el-option label="升序" value="asc" />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- 文献列表 -->
    <el-table
      :data="literatures"
      style="width: 100%"
      v-loading="loading"
      @row-click="openEditDialog"
      class="literature-table"
    >
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="year" label="年份" width="80" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="viewCount" label="浏览" width="80" />
      <el-table-column prop="downloadCount" label="下载" width="80" />
      <el-table-column prop="uploadDate" label="上传时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.uploadDate) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            @click.stop="openEditDialog(row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click.stop="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑文献"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editFormData" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editFormData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="editFormData.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="年份">
          <el-input-number
            v-model="editFormData.year"
            :min="1900"
            :max="new Date().getFullYear()"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editFormData.category" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editFormData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="页数">
          <el-input-number
            v-model="editFormData.totalPages"
            :min="1"
            placeholder="可选"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate" :loading="submitting">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传文献"
      width="600px"
      :close-on-click-modal="false"
    >
      <LiteratureUpload
        @success="handleUploadSuccess"
        @cancel="uploadDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { literatureApi, categoryApi } from '../api';
import type { Literature, LiteratureUpdateInput } from '../types/literatureTypes';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Refresh, Search } from '@element-plus/icons-vue';
import LiteratureUpload from './LiteratureUpload.vue';

const literatures = ref<Literature[]>([]);
const categories = ref<any[]>([]);
const loading = ref(false);
const editDialogVisible = ref(false);
const uploadDialogVisible = ref(false);
const submitting = ref(false);
const currentEditId = ref<string>('');

// 搜索和筛选
const searchKeyword = ref('');
const selectedCategory = ref('');
const sortBy = ref('uploadDate');
const sortOrder = ref('desc');

// 分页
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 编辑表单数据
const editFormData = ref({
  title: '',
  author: '',
  year: new Date().getFullYear(),
  description: '',
  category: '',
  totalPages: undefined as number | undefined,
});

onMounted(() => {
  loadCategories();
  loadLiteratures();
});

const loadCategories = async () => {
  try {
    categories.value = await categoryApi.getCategories();
  } catch (error) {
    console.error('加载分类失败:', error);
  }
};

const loadLiteratures = async () => {
  try {
    loading.value = true;
    const response = await literatureApi.getLiteratures({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
      category: selectedCategory.value || undefined,
      sortBy: sortBy.value as any,
      sortOrder: sortOrder.value as any,
    });

    // 处理返回的数据，添加 category 字段
    literatures.value = response.items.map((item: any) => ({
      ...item,
      category: item.categoryRef?.name || '未分类',
    }));

    total.value = response.pagination.total;
  } catch (error) {
    console.error('加载文献失败:', error);
    ElMessage.error('加载文献失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadLiteratures();
};

const handlePageChange = () => {
  loadLiteratures();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  loadLiteratures();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const openEditDialog = (literature: Literature) => {
  currentEditId.value = literature.id;
  editFormData.value = {
    title: literature.title,
    author: literature.author,
    year: literature.year,
    description: literature.description || '',
    category: literature.category,
    totalPages: literature.totalPages,
  };
  editDialogVisible.value = true;
};

const handleUpdate = async () => {
  try {
    submitting.value = true;

    if (!editFormData.value.title.trim()) {
      ElMessage.warning('请输入标题');
      return;
    }

    if (!editFormData.value.author.trim()) {
      ElMessage.warning('请输入作者');
      return;
    }

    if (!editFormData.value.category) {
      ElMessage.warning('请选择分类');
      return;
    }

    const updateData: LiteratureUpdateInput = {
      title: editFormData.value.title,
      author: editFormData.value.author,
      year: editFormData.value.year,
      description: editFormData.value.description,
      category: editFormData.value.category,
      totalPages: editFormData.value.totalPages,
    };

    await literatureApi.updateLiterature(currentEditId.value, updateData);
    ElMessage.success('文献更新成功');
    editDialogVisible.value = false;
    await loadLiteratures();
  } catch (error: any) {
    console.error('更新失败:', error);
    ElMessage.error(error.message || '更新失败');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (literature: Literature) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文献"${literature.title}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await literatureApi.deleteLiterature(literature.id);
    ElMessage.success('文献删除成功');

    // 如果当前页没有数据了，且不是第一页，则跳到上一页
    if (literatures.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }

    await loadLiteratures();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};

const openUploadDialog = () => {
  uploadDialogVisible.value = true;
};

const handleUploadSuccess = () => {
  uploadDialogVisible.value = false;
  ElMessage.success('文献上传成功');
  loadLiteratures();
};
</script>

<style scoped>
.literature-manager {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.literature-table {
  margin-bottom: 20px;
}

.literature-table :deep(.el-table__row) {
  cursor: pointer;
}

.literature-table :deep(.el-table__row:hover) {
  background-color: #f5f5f5;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>
