<template>
  <div class="category-manager">
    <div class="header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        添加分类
      </el-button>
    </div>

    <!-- 分类列表 -->
    <el-table :data="categories" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="分类名称" width="200" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="sortOrder" label="排序" width="100" />
      <el-table-column prop="literatureCount" label="文献数量" width="120" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button
            size="small"
            @click="openEditDialog(row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(row)"
            :disabled="row.literatureCount > 0"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="500px"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入分类描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sortOrder" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { categoryApi } from '../api';
import type { Category, CategoryCreateInput, CategoryUpdateInput } from '../types/literatureTypes';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const categories = ref<Category[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const submitting = ref(false);
const isEdit = ref(false);
const currentEditId = ref<string>('');

const formData = ref({
  name: '',
  description: '',
  sortOrder: 0,
});

onMounted(() => {
  loadCategories();
});

const loadCategories = async () => {
  try {
    loading.value = true;
    categories.value = await categoryApi.getCategories();
  } catch (error) {
    console.error('加载分类失败:', error);
    ElMessage.error('加载分类失败');
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  isEdit.value = false;
  formData.value = {
    name: '',
    description: '',
    sortOrder: 0,
  };
  dialogVisible.value = true;
};

const openEditDialog = (category: Category) => {
  isEdit.value = true;
  currentEditId.value = category.id;
  formData.value = {
    name: category.name,
    description: category.description || '',
    sortOrder: category.sortOrder,
  };
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    submitting.value = true;

    if (!formData.value.name.trim()) {
      ElMessage.warning('请输入分类名称');
      return;
    }

    if (isEdit.value) {
      // 更新分类
      const updateData: CategoryUpdateInput = {
        name: formData.value.name,
        description: formData.value.description,
        sortOrder: formData.value.sortOrder,
      };
      await categoryApi.updateCategory(currentEditId.value, updateData);
      ElMessage.success('分类更新成功');
    } else {
      // 创建分类
      const createData: CategoryCreateInput = {
        name: formData.value.name,
        description: formData.value.description,
        sortOrder: formData.value.sortOrder,
      };
      await categoryApi.createCategory(createData);
      ElMessage.success('分类创建成功');
    }

    dialogVisible.value = false;
    await loadCategories();
  } catch (error: any) {
    console.error('操作失败:', error);
    ElMessage.error(error.message || '操作失败');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (category: Category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${category.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await categoryApi.deleteCategory(category.id);
    ElMessage.success('分类删除成功');
    await loadCategories();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};
</script>

<style scoped>
.category-manager {
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
</style>
