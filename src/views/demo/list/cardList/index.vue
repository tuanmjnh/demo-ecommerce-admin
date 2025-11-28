<script setup lang="ts">
const currentRadio = ref(0)

const cardData = [
  {
    title: 'Category 1',
    id: 1,
    children: [
      {
        id: 0,
        title: 'Card',
        content: 'Card content',
      },
      {
        id: 1,
        title: 'Card 2',
        content: 'Card 2 content',
      },
    ],
  },
  {
    title: 'Category 2',
    id: 2,
    children: [
      {
        id: 0,
        title: 'Card',
        content: 'Card content',
      },
      {
        id: 1,
        title: 'Card 2',
        content: 'Card 2 content',
      },
    ],
  },
  {
    title: 'Category 3',
    id: 3,
    children: [
      {
        id: 0,
        title: 'Card',
        content: 'Card content',
      },
      {
        id: 1,
        title: 'Card 2',
        content: 'Card 2 content',
      },
    ],
  },
]
const radioDate = [
  {
    value: 0,
    label: 'All',
  },
  ...cardData.map((item) => {
    return { value: item.id, label: item.title }
  }),
]
</script>

<template>
  <n-card>
    <n-radio-group v-model:value="currentRadio" name="radiobuttongroup1">
      <n-radio-button v-for="item in radioDate" :key="item.value" :value="item.value" :label="item.label" />
    </n-radio-group>
    <n-card
      v-for="item in cardData" v-show="currentRadio === 0 || item.id === currentRadio" :key="item.id"
      :bordered="false" :title="item.title" content-style="padding: 0;"
    >
      <n-grid :x-gap="8" :y-gap="8" :cols="4">
        <n-gi v-for="card in item.children" :key="card.id">
          <n-card hoverable>
            <n-thing content-indented :title="card.title" description="09/30/2022" :content="card.content">
              <template #avatar>
                <n-icon color="#de4307" size="24">
                  <icon-park-outline-chart-histogram />
                </n-icon>
              </template>
              <template #action>
                <n-space justify="space-between">
                  <span />
                  <n-button>Activate</n-button>
                </n-space>
              </template>
              <template #header-extra>
                <n-tag type="info">
                  In effect
                </n-tag>
              </template>
            </n-thing>
          </n-card>
        </n-gi>
      </n-grid>
    </n-card>
  </n-card>
</template>

<style scoped></style>
