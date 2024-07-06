import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import store from "@/store";
import {Tool} from "@/util/tool";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/doc',
        name: 'doc',
        component: () => import(/* webpackChunkName: "about" */ '../views/doc.vue')
    },
    {
        path: '/admin/user',
        name: 'AdminUser',
        component: () => import(/* webpackChunkName: "about" */ '../views/admin/admin-user.vue'),
        meta: {
            loginRequest: true
        }
    },
    {
        path: '/about',
        name: 'about',
        component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
    }, {
        path: '/admin/ebook',
        name: 'AdminEbook',
        component: () => import(/* webpackChunkName: "about" */ '../views/admin/admin-ebook.vue'),
        meta: {
            loginRequest: true
        }
    },
    {
        path: '/admin/category',
        name: 'AdminCategory',
        component: () => import(/* webpackChunkName: "about" */ '../views/admin/admin-category.vue'),
        meta: {
            loginRequest: true
        }
    }
    ,{
        path: '/admin/doc',
        name: 'Admindoc',
        component: () => import(/* webpackChunkName: "about" */ '../views/admin/admin-doc.vue'),
        meta: {
            loginRequest: true
        }
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

// 路由登录拦截
router.beforeEach((to, from, next) => {
    // 要不要对meta.loginRequire属性做监控拦截
    if (to.matched.some(function (item) {
        console.log(item, "是否需要登录校验：", item.meta.loginRequire);
        return item.meta.loginRequire
    })) {
        const loginUser = store.state.user;
        if (Tool.isEmpty(loginUser)) {
            console.log("用户未登录！");
            next('/');
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router
