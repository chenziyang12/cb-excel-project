/**
 * @Author: chenziyang 1501844242@qq.com
 * @Date: 2023-07-17 09:44:38
 * @LastEditors: chenziyang 1501844242@qq.com
 * @LastEditTime: 2023-07-17 09:44:42
 * @FilePath: /v3-test/src/router/index.ts
 * @Description:
 * @Copyright (c) 2023 by 武汉嘉测科技有限公司 鄂公网安备案42018502004838号 All Rights Reserved.
 */
import { createRouter, createWebHashHistory } from "vue-router";
import { route } from "./route";
const router = createRouter({
  history: createWebHashHistory(),
  routes: route,
});

export default router;
