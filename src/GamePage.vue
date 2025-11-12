<template>
  <div class="game-page">
    <GameBoard
      v-if="quizQuestions.length"
      :question="quizQuestions[currentIndex]"
      :questionIndex="currentIndex"
      :totalQuestions="quizQuestions.length"
      @next-question="nextQuestion"
      @prev-question="prevQuestion"
    />

    <div class="navigation-buttons mt-6 flex justify-center gap-4">
      <button
        v-if="currentIndex > 0"
        @click="prevQuestion"
        class="game-btn bg-cyan-700 hover:bg-cyan-500"
      >
        上一題
      </button>

      <button
        v-if="currentIndex < quizQuestions.length - 1"
        @click="nextQuestion"
        class="game-btn bg-cyan-700 hover:bg-cyan-500"
      >
        下一題
      </button>

      <button
        v-if="currentIndex === 0"
        @click="goHome"
        class="game-btn bg-gray-700 hover:bg-gray-600"
      >
        回首頁
      </button>

      <button
        v-if="currentIndex === quizQuestions.length - 1"
        @click="prevQuestion"
        class="game-btn bg-gray-700 hover:bg-gray-600"
      >
        上一題
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import GameBoard from './GameBoard.vue';

const quizQuestions = ref([]);
const currentIndex = ref(0);

const fetchQuiz = async () => {
  const res = await fetch('http://localhost:3000/get-quiz');
  const data = await res.json();

  // --- 兩假一真邏輯 ---
  const grouped = {};
  data.forEach(d => {
    if (!grouped[d.type]) grouped[d.type] = [];
    grouped[d.type].push(d);
  });

  const finalQuestions = [];
  Object.values(grouped).forEach(group => {
    // 先抽兩假一真
    const scams = group.filter(q => q.isScam).slice(0,2);
    const real = group.filter(q => !q.isScam).slice(0,1);
    finalQuestions.push(...shuffleArray([...scams, ...real]));
  });

  quizQuestions.value = finalQuestions;
};

// 工具函式：洗牌
const shuffleArray = arr => [...arr].sort(() => 0.5 - Math.random());

const nextQuestion = () => {
  if (currentIndex.value < quizQuestions.value.length -1) currentIndex.value++;
};

const prevQuestion = () => {
  if (currentIndex.value > 0) currentIndex.value--;
};

const goHome = () => {
  window.location.reload(); // 或呼叫父組件事件
};

onMounted(fetchQuiz);
</script>
