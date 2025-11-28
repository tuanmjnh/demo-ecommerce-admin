<script setup lang="ts">
function testMsg() {
  window.$message.error('Once upon a time you dressed so fine')
}
</script>

<template>
  <div text-center c-red>
    Third level menu page
    <n-button strong secondary type="success" @click="testMsg">
      testMsg
    </n-button>
  </div>
</template>

<style scoped></style>
