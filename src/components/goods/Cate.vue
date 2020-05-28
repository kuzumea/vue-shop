<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="catelist"
        class="treeTable"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!--  是否有效-->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>

        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteConfirm(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5,10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClosed"
      width="50%"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父类分类：">
          <!-- options绑定数据源 -->
          <!-- porps指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            @change="parentCateChange"
            :props="{ expandTrigger: 'hover', value:'cat_id', label:'cat_name',children:'children', checkStrictly:'true'}"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="eidtDialogVisible"
      
      width="50%"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="editCateForm"
        :rules="addCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
  
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editcate">确 定</el-button>
      </span>
    </el-dialog>
      
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //商品分类的数据列表，默认为空
      catelist: [],
      //总数据条数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          //将当前列定义为模板列
          type: "template",
          //当前列使用的模板名称
          template: "isok"
        },
        {
          label: "排序",
          //将当前列定义为模板列
          type: "template",
          //当前列使用的模板名称
          template: "order"
        },
        {
          label: "操作",
          //将当前列定义为模板列
          type: "template",
          //当前列使用的模板名称
          template: "opt"
        }
      ],
      //控制添加分类对话框显示
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm: {
        cat_name: "",
        //父级分类id
        cat_pid: 0,
        //分类登记，默认添加1级分类
        cat_level: 0
      },
      //添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      //父级分类的列表
      parentCateList: [],

      //选中的父级分类的id数组
      selectedKeys: [],

      //edit对话框的显示
      eidtDialogVisible: false,

      //
      editCateForm:{}
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品数据失败！");
      }
      // console.log(res.data)
      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    //监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    //显示对话框
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }
      this.parentCateList = res.data;
      // console.log(this.parentCateList);
    },
    //选择项发生变化触发这个函数
    parentCateChange() {
      //如果selectedkeys数组中的length大于0.证明选中的父级分类
      //反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        //父级分类id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        //为当前分类等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;

        //为当前分类等级赋值

        this.addCateForm.cat_level = 0;
      }
    },
    //点击按钮添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return;

        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！");
        }

        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    //监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    //显示编辑对话框
    async showEditDialog(id) {
      
      const {data:res} = await this.$http.get('categories/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error('获取id失败')
      }
      this.editCateForm = res.data
      this.eidtDialogVisible = true;
    },
    //修改分类名称
    editcate() {
      this.$refs.editCateFormRef.validate(async valid=>{
        
        if(!valid) return 
        const {data:res} = await this.$http.put('categories/' + this.editCateForm.cat_id, {cat_name:this.editCateForm.cat_name})
      if(res.meta.status !== 200) {
        return this.$message.error('修改失败')
      }
      this.$message.success('修改成功')
      this.getCateList()
      this.eidtDialogVisible = false;
    })
    },

    //删除分类对话框
    async showDeleteConfirm(id) {
      const confirmResult = await this.$confirm("删除权限？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }
      const {data:res} = await this.$http.delete('categories/'+ id)
      if(res.meta.status !== 200){
        this.$message.error('删除错误！')
      }
      this.$message.success('删除成功！')
      this.getCateList()
    }
  }
};
</script>

<style lang="scss" scoped>
.treeTable {
  margin-top: 15px;
}
</style>