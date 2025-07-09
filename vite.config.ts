import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
// https://vitejs.dev/config/
export default defineConfig({
  base: "./", // 添加这行关键配置（相对路径）
  plugins: [vue(), vueJsx()],
});
