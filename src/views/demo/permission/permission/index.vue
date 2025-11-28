<script setup lang="ts">
import { usePermission } from '@/hooks'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()
const { hasPermission } = usePermission()

const roleList: Entity.RoleType[] = ['super', 'admin', 'user']

function toggleUserRole(role: Entity.RoleType) {
  authStore.login(role, '123456')
}
</script>

<template>
  <n-card title="Permissions Examples">
    <n-h1> Current permissions:{{ authStore.userInfo!.role }}</n-h1>
    <n-button-group>
      <n-button v-for="item in roleList" :key="item" type="default" @click="toggleUserRole(item)">
        {{ item }}
      </n-button>
    </n-button-group>
    <n-h2>v-permission Command usage</n-h2>
    <n-space>
      <n-button v-permission="['super']">
        Only visible to super
      </n-button>
      <n-button v-permission="['admin']">
        Visible to admin
      </n-button>
    </n-space>

    <n-h2>usePermission Function usage</n-h2>
    <n-space>
      <n-button v-if="hasPermission(['super'])">
        super visible
      </n-button>
      <n-button v-if="hasPermission(['admin'])">
        Visible to admin
      </n-button>
      <n-button v-if="hasPermission(['admin', 'user'])">
        Visible to admin and user
      </n-button>
    </n-space>
  </n-card>
</template>
