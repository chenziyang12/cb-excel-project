/**
 * @Author: = =
 * @Date: 2023-04-13 15:07:57
 * @LastEditors: = =
 * @LastEditTime: 2023-04-17 14:23:40
 * @FilePath: /v3-test/src/main.ts
 * @Description:
 * @Copyright (c) 2023 by 武汉嘉测科技有限公司 鄂公网安备案42018502004838号 All Rights Reserved.
 */
import { createApp } from "vue";
// import "./style.css";
import router from "./router";
import App from "./App.vue";
import TuiPlus from "@wocwin/t-ui-plus";
import "@wocwin/t-ui-plus/lib/style.css";
import JcUi from "jc-test-ui";
import "jc-test-ui/lib/style.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

createApp(App)
  .use(router)
  .use(TuiPlus)
  .use(JcUi)
  .use(ElementPlus)
  .mount("#app");
