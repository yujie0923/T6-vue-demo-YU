<template>
  <div class="admin-panel fixed right-4 top-1/4 p-4 bg-gray-900 rounded-lg w-72 flex flex-col gap-3 z-50 shadow-lg">
    <h3 class="text-white font-bold mb-2">管理員模式 - 調整眼球顏色</h3>

    <div class="flex flex-col gap-2" v-for="(label, index) in labels" :key="index">
      <label class="text-cyan-200">{{ label }}</label>
      <input type="color" v-model="eyeColors[index]" />
    </div>

    <button @click="saveEyeColors" class="game-btn mt-3 bg-green-600 hover:bg-green-500">
      儲存設定
    </button>
  </div>
</template>

<script setup>
import { reactive } from "vue";

defineProps({
  eyeColors: Array
});

const labels = ["眼球底色", "中間色", "外圍色", "瞳孔顏色"];

const saveEyeColors = async () => {
  try {
    const res = await fetch("http://localhost:3000/eye-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eyeColors })
    });
    const result = await res.json();
    if(result.success) alert("儲存成功");
    else alert("儲存失敗");
  } catch (err) {
    console.error(err);
    alert("儲存失敗");
  }
};
</script>

<style scoped>
.admin-panel input[type="color"] {
  width: 100%;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
