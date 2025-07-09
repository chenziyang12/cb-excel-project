<template>
  <el-row :gutter="24">
    <!-- 金蝶上传与展示 -->
    <el-col :span="12">
      <el-card shadow="hover">
        <template #header>
          <span>金蝶Excel上传</span>
        </template>
        <el-upload
          class="upload-demo"
          drag
          :show-file-list="false"
          accept=".xls,.xlsx"
          :before-upload="beforeKingdeeUpload"
          :on-error="onUploadError"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽或点击上传金蝶Excel</div>
        </el-upload>
        <el-table
          v-if="kingdeeRows.length"
          :data="kingdeeRows"
          style="margin-top: 12px"
          height="400px"
          size="small"
          border
          show-summary
          :summary-method="kingdeeSummaryMethod"
        >
          <el-table-column prop="date" label="记账日期" />
          <el-table-column prop="desc" label="摘要" />
          <el-table-column prop="amount" label="贷方金额" />
        </el-table>
      </el-card>
    </el-col>
    <!-- 西联上传与展示 -->
    <el-col :span="12">
      <el-card shadow="hover">
        <template #header>
          <span>西联Excel上传</span>
        </template>
        <el-upload
          class="upload-demo"
          drag
          :show-file-list="false"
          accept=".xls,.xlsx"
          :before-upload="beforeXilianUpload"
          :on-error="onUploadError"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽或点击上传西联Excel</div>
        </el-upload>
        <div v-if="orgOptions.length" style="margin-bottom: 8px">
          机构：<el-select
            v-model="selectedOrg"
            placeholder="请选择机构"
            clearable
            style="width: 200px"
          >
            <el-option label="全部机构" value="" />
            <el-option
              v-for="item in orgOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
        <el-table
          v-if="treeXilianRows.length"
          :data="treeXilianRows"
          style="margin-top: 12px"
          height="400px"
          size="small"
          border
          row-key="id"
          :tree-props="{ children: 'children' }"
          show-summary
          :summary-method="xilianSummaryMethod"
        >
          <el-table-column prop="orgCode" label="机构" />
          <el-table-column prop="periodKey" label="账期" />
          <el-table-column prop="date" label="记账日期" />
          <el-table-column prop="amount" label="贷款金额" />
          <el-table-column prop="monthSum" label="月累计金额">
            <template #default="scope">
              <span v-if="scope.row.children">{{
                Number(scope.row.monthSum).toFixed(2)
              }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
  <div style="margin-top: 24px; text-align: center">
    <el-button
      type="primary"
      size="large"
      @click="compare"
      :disabled="!kingdeeRows.length || !xilianRows.length"
      >对比</el-button
    >
  </div>
  <el-card v-if="diffRows.length" style="margin-top: 24px">
    <template #header>
      <span>不一致明细</span>
    </template>
    <el-table :data="diffRows" border size="small">
      <el-table-column prop="month" label="月份" />
      <el-table-column prop="kingdeeAmount" label="金蝶金额" />
      <el-table-column prop="xilianAmount" label="西联金额" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import * as XLSX from "xlsx";
import { ElMessage } from "element-plus";
import { strToDate } from "../assets/js/excel";

const kingdeeRows = ref<any[]>([]); // 金蝶账单明细
const xilianRows = ref<any[]>([]); // 西联账单明细
const diffRows = ref<any[]>([]); // 不一致明细
const orgOptions = ref<string[]>([]); // 机构下拉选项
const selectedOrg = ref<string>(""); // 当前选中机构

const filteredXilianRows = computed(() => {
  if (!selectedOrg.value) return xilianRows.value;
  return xilianRows.value.filter((row) => row.orgCode === selectedOrg.value);
});

// 树形结构：父节点为机构+账期，子节点为明细
const treeXilianRows = computed(() => {
  const rows = filteredXilianRows.value;
  if (!rows.length) return [];
  // 按机构+periodKey分组
  const groupMap: Record<string, any> = {};
  rows.forEach((row, idx) => {
    const key = row.orgCode + "-" + row.periodKey;
    if (!groupMap[key]) {
      groupMap[key] = {
        id: key,
        orgCode: row.orgCode,
        periodKey: row.periodKey,
        monthSum: row.monthSum,
        children: [],
      };
    }
    groupMap[key].children.push({
      ...row,
      id: key + "-" + idx,
    });
  });
  return Object.values(groupMap);
});

function onUploadError() {
  ElMessage.error("文件读取失败");
}

// 金蝶上传并解析
function beforeKingdeeUpload(file: File) {
  if (!file.name.endsWith(".xls") && !file.name.endsWith(".xlsx")) {
    ElMessage.error("请上传Excel文件");
    return false;
  }
  parseKingdeeExcel(file);
  return false; // 阻止自动上传
}
function parseKingdeeExcel(file: File) {
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
      if (!json.length) throw new Error("表格内容为空");
      const header = json[0] as string[];
      const dateIdx = header.findIndex((h) => h.includes("日期"));
      const descIdx = header.findIndex((h) => h.includes("摘要"));
      const amountIdx = header.findIndex((h) => h.includes("贷方金额"));
      if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
        ElMessage.error(
          "金蝶表头缺少必要字段【日期、摘要，贷方金额】，请检查表头！"
        );
        return;
      }
      kingdeeRows.value = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        const match =
          row[descIdx] && row[descIdx].indexOf("联营货款") !== -1 ? row : null;
        if (match && Number(row[amountIdx]) > 0) {
          kingdeeRows.value.push({
            date: strToDate(row[dateIdx]),
            desc: row[descIdx],
            amount: Number(row[amountIdx]),
            month: getMonthFromDate(strToDate(row[dateIdx])),
          });
        }
      }
      if (!kingdeeRows.value.length)
        ElMessage.warning('未找到"x月联营货款"相关数据');
    } catch (err: any) {
      ElMessage.error("金蝶Excel解析失败: " + err.message);
    }
  };
  reader.onerror = () => ElMessage.error("文件读取失败");
  reader.readAsArrayBuffer(file);
}

// 西联上传并解析
function beforeXilianUpload(file: File) {
  if (!file.name.endsWith(".xls") && !file.name.endsWith(".xlsx")) {
    ElMessage.error("请上传Excel文件");
    return false;
  }
  parseXilianExcel(file);
  return false;
}
function parseXilianExcel(file: File) {
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
      if (!json.length) throw new Error("表格内容为空");
      const header = json[0] as string[];
      // 机构编码字段名支持"机构"
      const orgIdx = header.findIndex((h) => h.includes("机构"));
      const dateIdx = header.findIndex((h) => h.includes("记帐日期"));
      const amountIdx = header.findIndex((h) => h.includes("货款金额"));
      if (orgIdx === -1 || dateIdx === -1 || amountIdx === -1) {
        ElMessage.error(
          "西联表头缺少必要字段【机构、记帐日期、货款金额】，请检查表头！"
        );
        return;
      }
      // 先解析所有明细
      const tempRows: any[] = [];
      const orgSet = new Set<string>();
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row[orgIdx] || !row[dateIdx] || !row[amountIdx]) continue;
        orgSet.add(row[orgIdx]);
        tempRows.push({
          orgCode: row[orgIdx],
          date: strToDate(row[dateIdx]),
          amount: Number(row[amountIdx]),
        });
      }
      orgOptions.value = Array.from(orgSet);
      // 按月统计24号~下月23号的累计金额
      const monthSumMap: Record<string, number> = {};
      tempRows.forEach((row) => {
        const { periodKey } = getXilianPeriod(row.date);
        const key = row.orgCode + "-" + periodKey;
        if (!monthSumMap[key]) monthSumMap[key] = 0;
        monthSumMap[key] += row.amount;
      });
      // 给每条明细加上月累计金额
      xilianRows.value = tempRows.map((row) => {
        const { periodKey } = getXilianPeriod(row.date);
        return {
          ...row,
          monthSum: monthSumMap[row.orgCode + "-" + periodKey].toFixed(2),
          periodKey,
        };
      });
      if (!xilianRows.value.length)
        ElMessage.warning("未找到有效的西联明细数据");
    } catch (err: any) {
      ElMessage.error("西联Excel解析失败: " + err.message);
    }
  };
  reader.onerror = () => ElMessage.error("文件读取失败");
  reader.readAsArrayBuffer(file);
}

// 工具函数：获取账期范围
function getPeriod(year: number, month: number) {
  // 账期为前一月24号~当月23号
  const start = new Date(year, month - 2, 24); // JS月份0起
  const end = new Date(year, month - 1, 23, 23, 59, 59);
  return { start, end };
}
// 获取日期对应的"24号~下月23号"期间的唯一key
function getXilianPeriod(dateStr: string) {
  const d = new Date(dateStr);
  let year = d.getFullYear();
  let month = d.getMonth() + 1; // 1-12
  // 24号~月底属于下一个账期
  if (d.getDate() >= 24) {
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  // 账期key如 2024-07
  const periodKey = `${year}-${String(month).padStart(2, "0")}`;
  return { periodKey, year, month };
}
// 获取日期的月份（用于金蝶）
function getMonthFromDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.getMonth() + 1;
}

// 金蝶表格合计方法
function kingdeeSummaryMethod({ data }: { data: any[] }) {
  return ["总条数", "", data.length];
}
// 西联表格合计方法
function xilianSummaryMethod({ data }: { data: any[] }) {
  return ["总条数", "", data.length, ""];
}

// 对比逻辑
function compare() {
  if (!kingdeeRows.value.length || !xilianRows.value.length) {
    ElMessage.warning("请先上传两份Excel");
    return;
  }
  diffRows.value = [];
  for (const kingdee of kingdeeRows.value) {
    // 记账日期格式如 2023-07-24
    const [y, m, d] = String(kingdee.date).split(/[\/-]/).map(Number);
    if (!y || !m || !d) continue;
    const { start, end } = getPeriod(y, kingdee.month);
    // 累加西联账期内的贷款金额
    const sum = xilianRows.value
      .filter((x) => {
        const [yy, mm, dd] = String(x.date).split(/[\/-]/).map(Number);
        if (!yy || !mm || !dd) return false;
        const dt = new Date(yy, mm - 1, dd);
        return dt >= start && dt <= end;
      })
      .reduce((acc, cur) => acc + cur.amount, 0);
    if (Math.abs(sum - kingdee.amount) > 0.01) {
      diffRows.value.push({
        month: kingdee.month + "月",
        kingdeeAmount: kingdee.amount,
        xilianAmount: sum,
      });
    }
  }
  if (!diffRows.value.length) {
    ElMessage.success("所有账单金额一致！");
  } else {
    ElMessage.warning("发现不一致账单，请核查！");
  }
}
</script>

<style scoped>
.upload-demo {
  width: 100%;
  margin-bottom: 12px;
}
.el-upload__text {
  color: #409eff;
  font-size: 14px;
}
</style>
