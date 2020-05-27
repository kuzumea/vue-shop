<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 ===0 ? 'bdtop':'', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2===0 ? '': 'bdtop','vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      type="success"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="290px">
          <template slot-scope="scope">
            <el-button
              @click="showEditDialog(scope.row.id)"
              size="mini"
              type="primary"
              icon="el-icon-edit"
            >编辑</el-button>
            <el-button
              @click="removeUserById(scope.row.id)"
              size="mini"
              type="danger"
              icon="el-icon-delete"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="roleForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="eidtDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="userInfo" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="userInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="userInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //添加用户表单数据
      roleForm: {
        roleName: "",
        roleDesc: ""
      },
      //添加用户表单验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ]
      },
      addDialogVisible: false,
      //获取角色数据
      userInfo: {},
      //编辑表单对话框的显示
      editDialogVisible: false,
      //权限对话框显示
      setRightDialogVisible: false,
      //所有权限的数据
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      //默认选中的id树
      defKeys: [],
      //当前即将分配权限的id
      roleId: []
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }

      this.rolelist = res.data;
      // console.log(this.rolelist)
    },
    //添加用户请求
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.roleForm);
        if (res.meta.status !== 201) {
          this.$message.error("添加角色失败！");
        }
        this.$message.success("添加角色成功！");
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },
    //关闭addroles对话框
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //显示editdialog
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      this.editDialogVisible = true;
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户失败！");
      }
      this.userInfo = res.data;
    },
    //点击确定发送修改请求
    editRoles() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.userInfo.roleId,
          { roleName: this.userInfo.roleName, roleDesc: this.userInfo.roleDesc }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败！");
        }
        this.editDialogVisible = false;
        this.getRolesList();
        this.$message.success("更新用户信息成功！");
      });
    },
    //关闭eiditrole对话框
    eidtDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //删除信息
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
      const { data: res } = await this.$http.delete("roles/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getRolesList();
    },
    //删除用户管理权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm("删除权限？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！");
      }

      // this.getRolesList() 这样会导致页面刷新，实际上delete请求会返回最新的数据
      role.children = res.data;
    },
    //展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      //获取所有权限数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限失败！");
      }
      //获取到的权限数据保存到data中
      this.rightsList = res.data;
      this.getDefKeys(role, this.defKeys);
      // console.log(this.defKeys)
      this.setRightDialogVisible = true;
    },
    //通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
    //如果当前node节点不包含children属性，则是三级节点
    getDefKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach(item => {
        this.getDefKeys(item, arr);
      });
    },
    //监听分配对话框的数据
    setRightDialogClosed() {
      this.defKeys = [];
    },
    //点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];

      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！");
      }
      this.$message.success("分配权限成功！");
      this.getRolesList();
      this.setRightDialogVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.el-tag {
  margin-top: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>