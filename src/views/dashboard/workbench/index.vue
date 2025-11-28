<script setup lang="ts">
import { useAuthStore } from '@/stores'
import Chart from './components/chart.vue'

const { user } = useAuthStore()
</script>

<template>
  <n-grid :x-gap="16" :y-gap="16">
    <n-gi :span="16">
      <n-space vertical :size="16">
        <n-card style="--n-padding-left: 0;">
          <Chart />
        </n-card>
        <n-card>
          <n-grid :x-gap="8" :y-gap="8">
            <n-gi :span="6">
              <n-card>
                <n-thing>
                  <template #avatar>
                    <n-el>
                      <n-icon-wrapper :size="46" color="var(--success-color)" :border-radius="999">
                        <nova-icon :size="26" icon="icon-park-outline:user" />
                      </n-icon-wrapper>
                    </n-el>
                  </template>
                  <template #header>
                    <n-statistic label="Active Users">
                      <n-number-animation show-separator :from="0" :to="12039" />
                    </n-statistic>
                  </template>
                </n-thing>
              </n-card>
            </n-gi>
            <n-gi :span="6">
              <n-card>
                <n-thing>
                  <template #avatar>
                    <n-el>
                      <n-icon-wrapper :size="46" color="var(--success-color)" :border-radius="999">
                        <nova-icon :size="26" icon="icon-park-outline:every-user" />
                      </n-icon-wrapper>
                    </n-el>
                  </template>
                  <template #header>
                    <n-statistic label="user">
                      <n-number-animation show-separator :from="0" :to="44039" />
                    </n-statistic>
                  </template>
                </n-thing>
              </n-card>
            </n-gi>
            <n-gi :span="6">
              <n-card>
                <n-thing>
                  <template #avatar>
                    <n-el>
                      <n-icon-wrapper :size="46" color="var(--success-color)" :border-radius="999">
                        <nova-icon :size="26" icon="icon-park-outline:preview-open" />
                      </n-icon-wrapper>
                    </n-el>
                  </template>
                  <template #header>
                    <n-statistic label="Views">
                      <n-number-animation show-separator :from="0" :to="551039" />
                    </n-statistic>
                  </template>
                </n-thing>
              </n-card>
            </n-gi>
            <n-gi :span="6">
              <n-card>
                <n-thing>
                  <template #avatar>
                    <n-el>
                      <n-icon-wrapper :size="46" color="var(--success-color)" :border-radius="999">
                        <nova-icon :size="26" icon="icon-park-outline:star" />
                      </n-icon-wrapper>
                    </n-el>
                  </template>
                  <template #header>
                    <n-statistic label="Number of Favorites">
                      <n-number-animation show-separator :from="0" :to="7739" />
                    </n-statistic>
                  </template>
                </n-thing>
              </n-card>
            </n-gi>
          </n-grid>
        </n-card>
        <n-card title="dynamic">
          <template #header-extra>
            <n-button type="primary" quaternary>
              More
            </n-button>
          </template>
          <n-list hoverable>
            <n-list-item>
              <template #prefix>
                <n-avatar round :size="48" :src="user?.avatar?.url" />
              </template>
              <n-thing title="How to get a car" title-extra="09/29/2022"
                description="It is an abbreviation for 'How can there be a car in my living room?', which refers to those who weave between lanes at will and treat the road as their living room. It is often sarcastic and is mainly used in car accident videos." />
            </n-list-item>
            <n-list-item>
              <template #prefix>
                <n-avatar round :size="48" :src="user?.avatar?.url" />
              </template>
              <n-thing title="Five Street Fitness Skills" title-extra="09/29/2022"
                description="The five magic skills of street fitness include 1. One-handed pull-up. 2. Slow double arm. 3. Human flag. 4. Front horizontal. 5. Russian push-up." />
            </n-list-item>
            <n-list-item>
              <template #prefix>
                <n-avatar round :size="48" :src="user?.avatar?.url" />
              </template>
              <n-thing title="Is there a prince who has been a prince for seventy years?" title-extra="09/29/2022"
                description="★Meaning: Used to mock the fact that the Queen of England has been on the throne for a very long time, which has led to her eldest son, Prince Charles, becoming the heir apparent who has waited the longest for the throne in history." />
            </n-list-item>
            <n-list-item>
              <template #prefix>
                <n-avatar round :size="48" :src="user?.avatar?.url" />
              </template>
              <n-thing title="What are you doing~Haha~Ouch~" title-extra="09/29/2022"
                description="Cai Xukun, who was born in the famous idol trainee program and trained for two and a half years, appeared in a variety show in 2018." />
            </n-list-item>
          </n-list>
        </n-card>
      </n-space>
    </n-gi>
    <n-gi :span="8">
      <n-space vertical :size="16">
        <n-card title="announcement">
          <template #header-extra>
            <n-button type="primary" quaternary>
              More
            </n-button>
          </template>
          <n-list>
            <n-list-item>
              <template #prefix>
                <n-tag :bordered="false" type="info" size="small">
                  notify
                </n-tag>
              </template>
              <n-button text>
                College Across the Ocean
              </n-button>
            </n-list-item>
            <n-list-item>
              <template #prefix>
                <n-tag :bordered="false" type="success" size="small">
                  information
                </n-tag>
              </template>
              <n-button text>
                You are playing something new
              </n-button>
            </n-list-item>
            <n-list-item>
              <template #prefix>
                <n-tag :bordered="false" type="warning" size="small">
                  Activity
                </n-tag>
              </template>
              <n-button text>
                The first sword on the shore is to kill the person you like
              </n-button>
            </n-list-item>
          </n-list>
        </n-card>
        <n-grid :x-gap="8" :y-gap="8">
          <n-gi :span="12">
            <n-card>
              <n-flex vertical align="center">
                <n-text depth="3">
                  Number of orders
                </n-text>
                <n-icon-wrapper :size="46" :border-radius="999">
                  <nova-icon :size="26" icon="icon-park-outline:all-application" />
                </n-icon-wrapper>
                <n-text strong class="text-2xl">
                  1,234,123
                </n-text>
              </n-flex>
            </n-card>
          </n-gi>
          <n-gi :span="12">
            <n-card>
              <n-flex vertical align="center">
                <n-text depth="3">
                  To Do
                </n-text>
                <n-el>
                  <n-icon-wrapper :size="46" color="var(--warning-color)" :border-radius="999">
                    <nova-icon :size="26" icon="icon-park-outline:list-bottom" />
                  </n-icon-wrapper>
                </n-el>
                <n-text strong class="text-2xl">
                  78
                </n-text>
              </n-flex>
            </n-card>
          </n-gi>
        </n-grid>
        <n-card title="Task Progress">
          <n-timeline>
            <n-timeline-item content="ah" />
            <n-timeline-item type="success" title="success" content="Where to succeed" time="2018-04-03 20:46" />
            <n-timeline-item type="error" content="What's wrong" time="2018-04-03 20:46" />
            <n-timeline-item type="warning" title="warn" content="Where is the warning" time="2018-04-03 20:46" />
            <n-timeline-item type="info" title="information" content="Yes" time="2018-04-03 20:46" line-type="dashed" />
            <n-timeline-item content="ah" />
          </n-timeline>
        </n-card>
      </n-space>
    </n-gi>
  </n-grid>
</template>

<style scoped></style>
