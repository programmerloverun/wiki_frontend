<template>

    <a-layout>

        <a-layout-sider width="200">
            <a-menu
                    mode="inline"
                    :style="{ height: '100%', borderRight: 0}"
                    @click="handleClick">
                <a-menu-item key="welcome">
                    <MailOutlined/>
                    <span>欢迎</span>
                </a-menu-item>
                <a-sub-menu v-for="item in level1" :key="item.id" :title="item.name">
                    <template v-slot:title>
                <span>
                    <user-outlined/>
                    {{ item.name }}
                </span>
                    </template>
                    <a-menu-item v-for="child in item.children" :key="child.id" @click="handleClick(child.id)">
                        <MailOutlined/>
                        <span>{{ child.name }}</span>
                    </a-menu-item>
                </a-sub-menu>
            </a-menu>
        </a-layout-sider>
        <!--        end  -->
        <a-layout-content
                :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
            <div class="welcome" v-show="isshowWelcome">
                <h1>欢迎使用leilei知识库</h1>
                <the-welcome></the-welcome>
            </div>
            <a-list v-show="!isshowWelcome" item-layout="vertical" size="large" :grid="{ gutter: 20, column: 3}"
                    :data-source="ebooks">
                <template #renderItem="{ item }">
                    <a-list-item key="item.id">
                        <template #actions>
          <span>
            <component v-bind:is="'FileOutlined'" style="margin-right: 8px"/>
            {{ item.docCount }}
          </span>
          <span>
            <component v-bind:is="'StarOutlined'" style="margin-right: 8px"/>
            {{ item.viewCount }}
          </span>
          <span>
            <component v-bind:is="'LikeOutlined'" style="margin-right: 8px"/>
            {{ item.voteCount }}
          </span>


                        </template>
                        <a-list-item-meta :description="item.description">
                            <template #title>
                                <router-link :to="'/doc?ebookId=' + item.id">
                                    {{ item.name }}
                                </router-link>
                            </template>
                            <template #avatar>
                                <a-avatar :src="item.cover"/>
                            </template>
                        </a-list-item-meta>
                    </a-list-item>
                </template>
            </a-list>
        </a-layout-content>
    </a-layout>
</template>

<script lang="ts">

import {
    StarOutlined,
    LikeOutlined,
    MessageOutlined,
    NotificationOutlined,
    LaptopOutlined,
    FileOutlined
} from '@ant-design/icons-vue';

import {defineComponent, onMounted, ref} from 'vue';

import axios from "axios"

import UserOutlined from "@/App.vue";

import {Tool} from "@/util/tool";

import {message} from "ant-design-vue";
import TheWelcome from "@/components/the-welcome.vue";

const listData: Record<string, string>[] = [];

export default defineComponent({

    components: {
        TheWelcome,
        LaptopOutlined,
        NotificationOutlined,
        UserOutlined,
        StarOutlined,
        LikeOutlined,
        MessageOutlined,
        FileOutlined

    },

    setup() {

        const ebooks: any = ref([])

        const level1 = ref();

        let categorys: any;

        let categoryId2 = 0;

        const handleQueryCategory = () => {

            axios.get(process.env.VUE_APP_SERVER + "/category/all").then((response) => {

                const data = response.data;

                if (data.success) {
                    categorys = data.content.list;
                    console.log("原始数组：", categorys);
                    level1.value = [];
                    level1.value = Tool.array2Tree({array: categorys, parentId: 0});
                    console.log("树形结构：", level1.value);
                    console.log(level1.value[0].name)
                } else {
                    message.error(data.message);
                }

            });

        };
        onMounted(() => {
            handleQueryCategory()

        })
        const handleQueryEbook = () => {
            axios.get(process.env.VUE_APP_SERVER + "/ebook/list", {
                params: {
                    page: 1,
                    size: 1000,
                    categoryId2: categoryId2
                }
            }).then((response) => {
                const data = response.data;
                console.log(data.content)
                ebooks.value = data.content.list;
                // ebooks1.books = data.content;
            }).catch((error) => {
                console.log(error);
            });

        }

        const handleClick = (value: any) => {
            console.log("handleClick" + value)
            if (value.key === 'welcome') {
                isshowWelcome.value = true
            } else {
                categoryId2 = value.key;
                isshowWelcome.value = false;
                if (categoryId2 != null) {
                    handleQueryEbook()
                }


            }
        }
        const isshowWelcome = ref(true)
        const pagination = {
            onChange: (page: number) => {
                console.log(page);
            },

            pageSize: 20,

        };

        const actions: Record<string, string>[] = [

            {type: 'StarOutlined', text: '156'},

            {type: 'LikeOutlined', text: '156'},

            {type: 'MessageOutlined', text: '2'},

        ];

        const weilcom = ref('欢迎')


        return {
            listData,
            pagination,
            actions,
            ebooks,
            level1,
            isshowWelcome,
            handleClick,
            weilcom
        };

    },

});

</script>

<style scoped>

.ant-avatar {

    width: 50px;

    height: 50px;

    line-height: 50px;

    border-radius: 8%;

    margin: 5px 0;

}

</style>
