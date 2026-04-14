<template>
  <div class="literature-upload">
    <el-steps :active="currentStep" finish-status="success" align-center>
      <el-step title="选择文件" />
      <el-step title="填写信息" />
      <el-step title="上传完成" />
    </el-steps>

    <!-- 步骤1: 选择文件 -->
    <div v-if="currentStep === 0" class="step-content">
      <el-upload
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="false"
        accept=".pdf"
        class="upload-area"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或<em>点击选择文件</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只支持 PDF 文件，且不超过 {{ maxFileSizeInMB }}MB
          </div>
        </template>
      </el-upload>

      <div v-if="selectedFile" class="file-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件名">
            {{ selectedFile.name }}
          </el-descriptions-item>
          <el-descriptions-item label="文件大小">
            {{ formatFileSize(selectedFile.size) }}
          </el-descriptions-item>
          <el-descriptions-item label="文件类型">
            {{ selectedFile.type }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- 步骤2: 填写信息 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入文献标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="作者" prop="author">
          <el-input
            v-model="formData.author"
            placeholder="请输入作者"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="年份" prop="year">
          <el-input-number
            v-model="formData.year"
            :min="1900"
            :max="new Date().getFullYear()"
            placeholder="请输入年份"
          />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select
            v-model="formData.category"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入文献描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="页数" prop="totalPages">
          <el-input-number
            v-model="formData.totalPages"
            :min="1"
            placeholder="可选，请输入总页数"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤3: 上传完成 -->
    <div v-if="currentStep === 2" class="step-content">
      <el-result
        icon="success"
        title="上传成功"
        sub-title="文献已成功上传到系统"
      >
        <template #extra>
          <el-button type="primary" @click="handleClose">关闭</el-button>
        </template>
      </el-result>
    </div>

    <!-- 进度显示 -->
    <div v-if="uploading" class="upload-progress">
      <el-progress :percentage="uploadProgress" :status="uploadStatus" />
      <p class="progress-text">{{ progressText }}</p>
    </div>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <el-button v-if="currentStep === 0" @click="handleCancel">取消</el-button>
      <el-button
        v-if="currentStep === 0"
        type="primary"
        :disabled="!selectedFile"
        @click="nextStep"
      >
        下一步
      </el-button>

      <el-button v-if="currentStep === 1" @click="prevStep">上一步</el-button>
      <el-button
        v-if="currentStep === 1"
        type="primary"
        :loading="uploading"
        @click="handleUpload"
      >
        {{ uploading ? '上传中...' : '开始上传' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { uploadApi, categoryApi } from '../api';
import { processPDF, extractFirstPageAsCover, formatFileSize } from '../utils/pdfProcessor';
import type { UploadFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';

const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

// 从环境变量读取文件大小限制，默认为 50MB
const maxFileSizeInMB: number = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '50', 10);
const maxSize: number = maxFileSizeInMB * 1024 * 1024;

const currentStep = ref(0);
const selectedFile = ref<File | null>(null);
const coverFile = ref<File | null>(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatus = ref<'success' | 'exception' | undefined>(undefined);
const progressText = ref('');
const categories = ref<any[]>([]);
const processingPdf = ref(false);

const formRef = ref<FormInstance>();
const formData = ref({
  title: '',
  author: '',
  year: new Date().getFullYear(),
  category: '',
  description: '',
  totalPages: undefined as number | undefined,
});

const formRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  year: [{ required: true, message: '请输入年份', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
};

onMounted(() => {
  loadCategories();
});

const loadCategories = async () => {
  try {
    categories.value = await categoryApi.getCategories();
  } catch (error) {
    console.error('加载分类失败:', error);
  }
};

const handleFileChange = async (file: UploadFile) => {
  const rawFile = file.raw;
  console.log('选择的文件:', rawFile);

  if (!rawFile) {
    return;
  }

  // 验证文件类型
  if (rawFile.type !== 'application/pdf') {
    ElMessage.error('只支持 PDF 文件');
    return;
  }

  // 验证文件大小
  if (rawFile.size > maxSize) {
    ElMessage.error(`文件大小不能超过 ${maxFileSizeInMB}MB`);
    return;
  }

  selectedFile.value = rawFile;

  // 自动填充标题（去掉扩展名）
  if (!formData.value.title) {
    formData.value.title = rawFile.name.replace('.pdf', '');
  }

  // 处理PDF：提取元数据和封面
  processingPdf.value = true;
  try {
    // 提取PDF元数据
    const pdfData = await processPDF(rawFile);

    // 自动填充表单数据
    if (pdfData.author && !formData.value.author) {
      formData.value.author = pdfData.author;
    }
    if (pdfData.pageCount && !formData.value.totalPages) {
      formData.value.totalPages = pdfData.pageCount;
    }

    // 提取第一页作为封面
    ElMessage.info('正在提取封面...');
    const coverBlob = await extractFirstPageAsCover(rawFile);
    coverFile.value = new File([coverBlob], `${rawFile.name.replace('.pdf', '')}_cover.jpg`, {
      type: 'image/jpeg'
    });

    ElMessage.success('PDF处理完成！');
  } catch (error) {
    console.error('PDF处理失败:', error);
    ElMessage.warning('PDF处理失败，将继续上传但可能缺少封面');
  } finally {
    processingPdf.value = false;
  }
};

const nextStep = () => {
  currentStep.value++;
};

const prevStep = () => {
  currentStep.value--;
};

const handleUpload = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    if (!selectedFile.value) {
      ElMessage.warning('请先选择文件');
      return;
    }

    if (processingPdf.value) {
      ElMessage.warning('PDF处理中，请稍候...');
      return;
    }

    uploading.value = true;
    uploadProgress.value = 0;
    uploadStatus.value = undefined;
    progressText.value = '正在准备上传...';

    // 使用完整的上传流程，包含封面
    await uploadApi.uploadLiterature(
      selectedFile.value,
      {
        title: formData.value.title,
        author: formData.value.author,
        year: formData.value.year,
        description: formData.value.description,
        category: formData.value.category,
        totalPages: formData.value.totalPages,
        cover: coverFile.value || undefined, // 传递封面文件
      },
      (progress) => {
        uploadProgress.value = progress;
        if (progress < 20) {
          progressText.value = '正在获取上传凭证...';
        } else if (progress < 60) {
          progressText.value = `正在上传PDF文件... ${progress}%`;
        } else if (progress < 80) {
          progressText.value = `正在上传封面... ${progress}%`;
        } else {
          progressText.value = '正在保存文献信息...';
        }
      }
    );

    uploadStatus.value = 'success';
    progressText.value = '上传完成！';

    // 延迟跳转到完成页面
    setTimeout(() => {
      currentStep.value = 2;
      emit('success');
    }, 500);
  } catch (error: any) {
    console.error('上传失败:', error);
    uploadStatus.value = 'exception';
    ElMessage.error(error.message || '上传失败，请重试');
  } finally {
    uploading.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};

const handleClose = () => {
  emit('success');
};

// 重置表单
const resetForm = () => {
  currentStep.value = 0;
  selectedFile.value = null;
  coverFile.value = null;
  uploading.value = false;
  uploadProgress.value = 0;
  uploadStatus.value = undefined;
  progressText.value = '';
  processingPdf.value = false;
  formData.value = {
    title: '',
    author: '',
    year: new Date().getFullYear(),
    category: '',
    description: '',
    totalPages: undefined,
  };
  formRef.value?.resetFields();
};

// 暴露重置方法给父组件
defineExpose({
  resetForm,
});
</script>

<style scoped>
.literature-upload {
  padding: 20px;
}

.step-content {
  margin: 30px 0;
  min-height: 300px;
}

.upload-area {
  margin: 20px 0;
}

.file-info {
  margin-top: 20px;
}

.upload-progress {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.progress-text {
  text-align: center;
  margin-top: 10px;
  color: #666;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}
</style>
