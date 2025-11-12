<template>
  <header class="header">
    <div class="title">Scam Master</div>
    <div class="stats">
      Round {{ round }}/5 | Score {{ score }}
    </div>
  </header>
</template>

<script setup>
defineProps({
  round: Number,
  score: Number
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  color: #00ffcc;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 0 0 5px #00ffcc;
}
</style>
