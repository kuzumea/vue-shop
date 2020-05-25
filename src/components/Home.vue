<template>
  <el-container class="homt-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
      <img src="../assets/heima.png" alt="">
      <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 侧边栏菜单 -->
          <el-menu
            background-color=rgb(54,61,64)
            text-color="#fff"
            active-text-color=rgb(86,126,181) :unique-opened="true" 
            :collapse="isCollapse"
            :collapse-transition="false"
            router
            :default-active="activePath"
            >
            <!-- 一级菜单 -->
            <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
              <!-- 模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <span>{{item.path}}</span>
              </template>
                <!-- 二级 -->
              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" 
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
              >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <span>{{subItem.path}}</span>
              </template> 
              </el-menu-item>
              </el-submenu>
          </el-menu>
      </el-aside>
        <!-- 主体 -->
        <el-main>
          <!-- 路由占位符(子组件) -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  data(){
    return{
    menulist:[],
    iconsObj:{
      '125':'iconfont icon-user',
      '103':'iconfont icon-tijikongjian',
      '101':'iconfont icon-shangpin',
      '102':'iconfont icon-danju',
      '145':'iconfont icon-baobiao',
    },
    //是否折叠
    isCollapse:false,
    //被激活的连接地址
    activePath:''
    }
  },
  created(){
    this.getMenulist(),
    this.activePath = window.sessionStorage.getItem('activePath')
  }
  ,
  methods:{
    logout(){
      window.sessionStorage.clear();
      this.$router.push('/login')
    },
    async getMenulist(){
      const {data: res} = await this.$http.get('menus')
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // console.log(res)
    },
    //点击折叠
    toggleCollapse(){
      this.isCollapse = ! this.isCollapse
    },
    //保存链接的激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.homt-container {
  height: 100%;
}

.el-header {
  background-color:rgb(54,61,64);
  display: flex;
  justify-content: space-between;
  padding-left: 0px;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: rgb(49,55,67);
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: rgb(233,237,241);
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: rgb(49,55,67);
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>