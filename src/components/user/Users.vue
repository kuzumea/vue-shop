<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框 -->

      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- slot-scope接受当前数据 -->
            <!-- 作用域插槽 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
              <!-- scope.row获取当前行数据 v-model双向绑定-->
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%"
    @close="setRoleDialogClosed">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>

        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </div>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //验证邮箱的规则
    var checkEmail = (rulem, value, cb) => {
      //正则
      const rgeEmail = /^([a-zA-Z0-9]+@[a-zA-Z0-9]*)+(\.[a-zA-Z0-9_-])/;
      if (rgeEmail.test(value)) {
        //合法
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };

    //验证手机号的规则
    var checkMobile = (rulem, value, cb) => {
      const rgeMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

      if (rgeMobile.test(value)) {
        //合法
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      //获取用户列表参数
      queryInfo: {
        query: "",
        //当前页数
        pagenum: 1,
        //当前页面数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      //控制对话框的显示与隐藏
      addDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { min: 6, max: 15, message: "邮箱格式错误", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { min: 6, max: 15, message: "手机格式错误", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      //控制修改对话框的显示与隐藏
      editDialogVisible: false,
      //查询带的用户信息对象
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { min: 6, max: 15, message: "邮箱格式错误", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { min: 6, max: 15, message: "手机格式错误", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      //控制分配角色对话框显示与隐藏
      setRoleDialogVisible: false,
      //需要被分配角色的用户信息
      userInfo: {},
      //所有角色的数据
      rolesList: {},
      //已选中的角色ID值
      selectedRoleId:''
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败！");
      }
      this.userlist = res.data.users;
      this.total = res.data.total;
      // console.log(this.userlist)
    },
    //监听pagesize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    //监听页码值改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //监听switch开光状态的改变
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户数据失败！");
      }
      this.$message.success("更新成功！");
    },
    //监听对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        //发起添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addForm);

        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败！");
        }
        this.$message.success("更新用户数据成功！");
        this.addDialogVisible = false;
        //重新获取用户列表
        this.getUserList;
      });
    },
    //展示编辑用户信息对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("users/" + id);
      this.editDialogVisible = true;
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户失败！");
      }
      this.editForm = res.data;
      // this.$message.success('查询用户数据成功！')
    },
    //监听修改用户对话框的关闭
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        //发起修改用户的数据请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败！");
        }
        //关闭对话框
        this.editDialogVisible = false;
        //刷新数据列表
        this.getUserList();
        //提示修改成功
        this.$message.success("更新用户信息成功！");
      });
    },
    //根据id删除信息
    async removeUserById(id) {
      //询问用户是否删除
      const confirmResult = await this.$confirm(
        "永久删除该用户，是否继续",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      //用户确认，返回confirm
      //用户取消，返回cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("users/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getUserList();
    },
    //展示分配角色对话框
    async setRole(userInfo) {
      this.userInfo = userInfo;

      //展示对话框之前获取所有角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolesList = res.data;

      this.setRoleDialogVisible = true;
    },
    //点击按钮，分配角色
    async saveRoleInfo(){
      if(!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色！");
      }

      const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid :this.selectedRoleId})
      if (res.meta.status !== 200) {
        return this.$message.error("更新角色失败！");
      }


      this.$message.success("更新角色成功！");
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    //监听分配角色对话框的关闭事件
    setRoleDialogClosed(){
      this.selectedRoleId = ''
      this.userInfo = ''
    }
  }
};
</script>

<style lang="less" scoped>
</style>