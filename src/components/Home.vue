<template>
  <div>
    <el-button type="info" @click="logout">tuichu</el-button>
  </div>
</template>

<script>
export default {
  methods:{
    logout(){
      window.sessionStorage.clear();
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>