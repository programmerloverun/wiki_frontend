import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd, {message} from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import axios from "axios";
import {MailOutlined, UserOutlined} from "@ant-design/icons-vue";
import {Tool} from "@/util/tool";

axios.defaults.baseURL = process.env.VUE_APP_SERVER;

/**
 * axios拦截器
 */
axios.interceptors.request.use(function (config) {
    console.log('请求参数：', config);
    const token = store.state.user.token;
    if (Tool.isNotEmpty(token)) {
        config.headers.token = token;
        console.log("请求headers增加token:", token);
    }
    return config;
}, error => {
    return Promise.reject(error);
});
axios.interceptors.response.use(function (response) {
    console.log('返回结果：', response);
    return response;
}, error => {
    // console.log('返回错误：', error);
    // const response = error.response;
    // const status = response.status;
    // if (status!== null && status === 401) {
    //     // 判断状态码是401 跳转到首页或登录页
    //     console.log("未登录，跳到首页");
    //     store.commit("setUser", {});
        message.error("未登录或登录超时");
        router.push('/');
    // }
    return Promise.reject(error);
});


const app = createApp(App)
app.use(Antd)
app.use(store)
app.use(router)
app.component(UserOutlined.name, UserOutlined);
app.component(MailOutlined.name, MailOutlined);
app.mount('#app')

