import { RouteRecordRaw } from "vue-router";
import Home from "../components/home.vue";

export const route: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    component: Home,
    children: [],
  },
];
