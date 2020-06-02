import Vue from 'vue'
import {Input,
   Message, 
   FormItem, 
   Form, 
   Button, 
   Container, 
   Aside, 
   Header, 
   Main,
   Menu,
   Submenu,
   MenuItem,
   Breadcrumb,
   BreadcrumbItem,
   Card,
   Row,
   Col,
   Table,
   TableColumn,
   Switch,
   Tooltip,
   Pagination,
   Dialog,
   MessageBox,
   Tag,
   Tree,
   Option,
   Select,
   Cascader,
   Alert,
   Tabs,
   TabPane,
   Steps,
   Step,
   Checkbox,
   CheckboxGroup,
   Upload,
  } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)

Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Option)
Vue.use(Select)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Upload)


Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
