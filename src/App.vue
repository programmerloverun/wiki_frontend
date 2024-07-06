<template>
    <a-layout id="components-layout-demo-top-side-2">
        <the-header/>
        <router-view/>
        <the-footer/>
    </a-layout>

</template>
<script lang="ts">
import {UserOutlined, LaptopOutlined, NotificationOutlined} from '@ant-design/icons-vue';
import {defineComponent, ref} from 'vue';
import TheFooter from "@/components/the-footer.vue";
import TheHeader from "@/components/the-header.vue";
import axios from "axios";

export default defineComponent({
    components: {
        TheHeader,
        TheFooter,
        UserOutlined,
        LaptopOutlined,
        NotificationOutlined,
    },

});
</script>
<style>
#components-layout-demo-top-side-2 .logo {
    float: left;
    width: 120px;
    height: 31px;
    margin: 16px 28px 16px 0;
    background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side-2 .logo {
    float: right;
    margin: 16px 0 16px 24px;
}

.site-layout-background {
    background: #fff;
}
</style>
