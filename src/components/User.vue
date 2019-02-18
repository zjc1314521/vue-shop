<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            v-model="queryParams.query"
            :clearable="true"
            @clear="getUserInfos"
            @keyup.enter.native="getUserInfos"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserInfos"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userInfos" border style="width: 100%">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="手机号码" width="140"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="130"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column label="状态" width="70">
          <el-switch
            slot-scope="scope"
            v-model="scope.row.mg_state"
            @change="changeState(scope.row.id,scope.row.mg_state)"
          ></el-switch>
        </el-table-column>
        <el-table-column label="操作" width="230">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(info.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delUser(info.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配绝色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[2,3]"
        :pagesize="queryParams.pagesize"
        layout="total,sizes, prev, pager, next,jumper"
        :total="queryParams.total"
      ></el-pagination>
      <!-- 添加用户 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="czbd">
        <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户信息 -->
      <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="czbd">
        <el-form ref="editFormRef" :rules="editFormRules" :model="editForm" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" :disabled="true"></el-input>
          </el-form-item>
          <!-- <el-form-item label="密码" prop="password">
          <el-input v-model="editForm.password" type="password"></el-input>-->
          <!-- </el-form-item> -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserInfos()
  },
  methods: {
    // 修改用户
    async showEditDialog(id) {
      this.editDialogVisible = true
      // 把修改的用户信息展示到form表单中
      // 根据id查询被修改的用户信息
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 接受被修改用户信息
      this.editForm = res.data
    },
    // 接受信息入库存储
    async editUser() {
      // axios提交数据入库存储
      // 用户id已经被存储赋予给editForm.id成员里面了（点按钮的时候赋予的）
      const { data: res } = await this.$http.put(
        'users/' + this.editForm.id,
        this.editForm
      )
      if(res.meta.status !==200){
        return this.$message.error(res.meta.msg)
      }
      // 修改用户信息完毕（关闭dialog更新列表数据）成功提示
      this.editDialogVisible = false
      this.$message.success(res.meta.msg)
      this.getUserInfos()

    },
    // 删除用户
    delUser(id) {
      //  确认操作
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          //axios触发api接口删除
          const { data: res } = await this.$http.delete('users/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }

          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getUserInfos()
        })
        .catch(() => {})
    },
    // 收集用户信息储存到后端数据库去
    addUser() {
      // 进行客户端form表单校验
      this.$refs.addFormRef.validate(async valid => {
        // 校验成功的处理
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          // 关闭框  提示成功信息 即使把新添加的用户刷新出来
          this.addDialogVisible = false
          this.$message.success(res.meta.msg)
          this.getUserInfos()
        }
      })
    },
    czbd() {
      this.$refs.addFormRef.resetFields()
    },
    async changeState(id, state) {
      const { data: res } = await this.$http.put(`users/${id}/state/${state}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('修改用户状态失败!')
      }
      this.$message({
        message: '修改状态成功',
        type: 'success',
        duration: 1500
      })
    },
    handleSizeChange(val) {
      this.queryParams.pagesize = val
      this.getUserInfos()
    },
    handleCurrentChange(val) {
      this.queryParams.pagenum = val

      this.getUserInfos()
    },
    async getUserInfos() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.queryParams.total = res.data.total
      // 把获取到的用户数据 赋予给uesrsifors
      this.userInfos = res.data.users
      console.log(this.userInfos)
    }
  },
  data() {
    // 自动以校验器
    var checkMobile = (rule, value, callback) => {
      if (!/^1[35789]\d{9}$/.test(value)) {
        return callback(new Error('手机格式不正确'))
      }
      callback() // 继续执行
    }
    return {
      // 修改用户相关
      editDialogVisible: false,
      editForm: {
        username: '',
        elail: '',
        mobile: ''
      },
      // form表单校验规则制作
      editFormRules: {
        mobile: [
          { required: true, message: '手机号必填', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },

      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        elail: '',
        mobile: ''
      },
      // form表单校验规则制作
      addFormRules: {
        username: [{ required: true, message: '用户名必填', trigger: 'blur' }],
        password: [{ required: true, message: '密码必填', trigger: 'blur' }],
        mobile: [
          { required: true, message: '手机号必填', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      keywords: '',
      userInfos: [],
      queryParams: {
        query: '',
        pagenum: 1,
        pagesize: 2,
        total: 0
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
