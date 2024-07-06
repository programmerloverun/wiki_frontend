<template>
    <a-row :gutter="24">
        <a-col :span="8">
            <a-layout>
                <a-layout-content
                    :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
                >
                    <p>
                        <a-form layout="inline" :model="param">
                            <a-form-item>
                                <a-button type="primary" @click="handleQuery()">
                                    查询
                                </a-button>
                            </a-form-item>
                            <a-form-item>
                                <a-button type="primary" @click="add()">
                                    新增
                                </a-button>
                            </a-form-item>
                        </a-form>
                    </p>
                    <p>
                        <a-alert
                            class="tip"
                            message="小提示：这里的分类会显示到首页的侧边菜单"
                            type="info"
                            closable
                        />
                    </p>
                    <a-table
                        v-if="level1.length > 0"
                        :columns="columns"
                        :row-key="record => record.id"
                        :data-source="level1"
                        :loading="loading"
                        :pagination="false"
                        :defaultExpandAllRows="true"
                        size="small"
                    >
                        <template #cover="{ text: cover }">
                            <img v-if="cover" :src="cover" alt="avatar"/>
                        </template>
                        <template v-slot:action="{ text, record }">
                            <a-space size="small">
                                <a-button type="primary" @click="edit(record)" size="small">
                                    编辑
                                </a-button>
                                <a-popconfirm
                                    title="删除后不可恢复，确认删除?"
                                    ok-text="是"
                                    cancel-text="否"
                                    @confirm="handleDelete(record.id)"
                                >
                                    <a-button size="small" type="danger">
                                        删除
                                    </a-button>
                                </a-popconfirm>
                            </a-space>
                        </template>
                    </a-table>
                </a-layout-content>

            </a-layout>
        </a-col>
        <a-col :span="16">
            <p>
                <a-form layout="inline" :model="param">
                    <a-form-item>
                        <a-button type="primary" @click="handleSave()">
                            保存
                        </a-button>
                    </a-form-item>
                </a-form>
            </p>
            <p>
            <a-form :model="doc" layout="vertical" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-form-item label="名称">
                    <a-input v-model:value="doc.name" placeholder="名称"/>
                </a-form-item>
                <a-form-item label="名称">
                    <a-tree-select
                        v-model:value="doc.parent"
                        style="width: 100%"
                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                        :tree-data="level1"
                        placeholder="请选择父文档"
                        tree-default-expand-all
                        :fieldNames="{ title: 'name', value: 'id', label: 'name' }"
                    >
                    </a-tree-select>
                </a-form-item>
                <a-form-item label="父分类">
                    <a-select
                        v-model:value="doc.parent"
                        ref="select"
                    >
                        <a-select-option :value="0">
                            无
                        </a-select-option>
                        <a-select-option v-for="c in level1" :key="c.id" :value="c.id" :disabled="doc.id === c.id">
                            {{ c.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="顺序">
                    <a-input v-model:value="doc.sort" placeholder="顺序"/>
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" @click="handlePreviewContent()" :visible="drawerVisible" @close="onDrawerClose()">
                        内容预览
                    </a-button>
                </a-form-item>
                <div id="content"></div>
            </a-form></p>
        </a-col>

    </a-row>
    <a-drawer
        width="800"
        placement="right"
        :closable="false"
        :visible="drawerVisible"
        @close="onDrawerClose()"
    >
        <div class="wangeditor" :innerHTML="previewHtml"></div>
    </a-drawer>
</template>

<script lang="ts">
import {createVNode, defineComponent, onMounted, ref} from 'vue';
import axios from 'axios';
import {message, Modal} from 'ant-design-vue';
import {Tool} from "@/util/tool";
import {useRoute} from "vue-router";
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";
import E from 'wangeditor';

export default defineComponent({
    name: 'Admin-doc',
    setup: function () {
        const route = useRoute();
        const param = ref();
        param.value = {};
        const docs = ref();
        const loading = ref(false);
        const treeSelectData = ref();
        treeSelectData.value = [];
        const drawerVisible = ref(false);
        const previewHtml = ref();
        const handlePreviewContent = () => {
            const html = editor.txt.html();
            previewHtml.value = html;
            drawerVisible.value = true;
        };
        const onDrawerClose = () => {
            drawerVisible.value = false;
        };



        const columns = [
            {
                title: '名称',
                dataIndex: 'name'
            },
            {
              title: '名称',
              dataIndex: 'name',
              slots: {customRender: 'name'}
            },
            {
                title: 'Action',
                key: 'action',
                slots: {customRender: 'action'}
            }
        ];

        const level1 = ref(); // 一级分类树，children属性就是二级分类
        level1.value = [];

        /**
         * 数据查询
         **/
        const handleQuery = () => {
            loading.value = true;
            // 如果不清空现有数据，则编辑保存重新加载数据后，再点编辑，则列表显示的还是编辑前的数据
            level1.value = [];
            axios.get(process.env.VUE_APP_SERVER + "/doc/list").then((response) => {
                loading.value = false;
                const data = response.data;
                if (data.success) {
                    docs.value = data.content.list;
                    console.log("原始数组：", docs.value);

                    level1.value = [];
                    level1.value = Tool.array2Tree({array: docs.value, parentId: 0});
                    console.log("树形结构：", level1.value);

                    treeSelectData.value = Tool.copy(level1.value);
                    treeSelectData.value.unshift({id: 0, name: "无"})
                } else {
                    message.error(data.message);
                }
            });
        };
        // -------- 表单 ---------

        const modalVisible = ref(false);
        const modalLoading = ref(false);
        const editor = new E('#content');
        editor.config.zIndex = 0;
        const doc = ref();
        doc.value = {
            ebookId: route.query.ebookId
        };

        const handleModalOk = () => {
            modalLoading.value = true;
            doc.value.content = editor.txt.html();
            axios.post(process.env.VUE_APP_SERVER + "/doc/save", doc.value).then((response) => {
                modalLoading.value = false;
                const data = response.data;
                if (data.success) {
                    // modalVisible.value = false;
                    message.success("保存成功");
                    doc.value = {};
                    editor.txt.clear();

                    // 重新加载列表
                    handleQuery();
                } else {
                    message.error(data.message);
                }

            });
        };

        /**
         * 内容查询
         */
        const handleQueryContent = () => {
            axios.get(process.env.VUE_APP_SERVER + "/doc/find-content/" + doc.value.id).then((response) => {
                const data = response.data;
                if (data.success) {
                    const content = data.content;
                    editor.txt.html(content);
                } else {
                    message.error(data.message);
                }
            });
        };

        /**
         * 编辑
         */
        const edit = (record: any) => {
            editor.txt.clear();
            modalVisible.value = true;
            doc.value = Tool.copy(record);
            handleQueryContent();

        };

        /**
         * 新增
         */
        const add = () => {
            modalVisible.value = true;
            doc.value = {
                ebookId: route.query.ebookId
            };
        };


        const deleteIds: Array<string> = [];
        const deleteNames: Array<string> = [];
        /**
         * 查找整根树枝
         */
        const getDeleteIds = (treeSelectData: any, id: any) => {
            // console.log(treeSelectData, id);
            // 遍历数组，即遍历某一层节点
            for (let i = 0; i < treeSelectData.length; i++) {
                const node = treeSelectData[i];
                if (node.id === id) {
                    // 如果当前节点就是目标节点
                    console.log("delete", node);
                    // 将目标ID放入结果集ids
                    // node.disabled = true;
                    deleteIds.push(id);
                    deleteNames.push(node.name);

                    // 遍历所有子节点
                    const children = node.children;
                    if (Tool.isNotEmpty(children)) {
                        for (let j = 0; j < children.length; j++) {
                            getDeleteIds(children, children[j].id)
                        }
                    }
                } else {
                    // 如果当前节点不是目标节点，则到其子节点再找找看。
                    const children = node.children;
                    if (Tool.isNotEmpty(children)) {
                        getDeleteIds(children, id);
                    }
                }
            }
        };
        const visible = ref<boolean>(false);
        const showModal = () => {
            visible.value = true;
        };
        const hideModal = () => {
            visible.value = false;
        };
        const handleDelete = (id: number) => {
            getDeleteIds(level1.value, id);
            Modal.confirm({
                title: '重要提醒',
                icon: createVNode(ExclamationCircleOutlined),
                content: '将删除：【' + deleteNames.join("，") + "】删除后不可恢复，确认删除？",
                onOk() {
                    axios.delete(process.env.VUE_APP_SERVER + "/doc/delete/" + deleteIds.join(",")).then((response) => {
                        const data = response.data; // data = commonResp
                        if (data.success) {
                            // 重新加载列表
                            handleQuery();
                        } else {
                            message.error(data.message);
                        }
                    });

                },
            });
            hideModal()

        };

        onMounted(() => {
            handleQuery();
            editor.create();
        });

        return {
            param,
            // docs,
            level1,
            columns,
            loading,
            handleQuery,

            edit,
            add,

            doc,
            modalVisible,
            modalLoading,
            handleSave: handleModalOk,

            handleDelete,
            handlePreviewContent,
            onDrawerClose,
            drawerVisible,
            previewHtml,
        }
    }
});
</script>

<style scoped>
img {
    width: 50px;
    height: 50px;
}
</style>
