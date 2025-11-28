<template>
  <n-space vertical>
    <n-card title="Icon selector">
      <icon-select />
    </n-card>
    <n-card title="Auto-import icon">
      <div>
        Normal: <icon-park-outline-apple />
      </div>
      <div>
        Large: <icon-park-outline-apple class="text-2em" />
      </div>
      <div>
        Very large: <icon-park-outline-apple class="text-4em" />
      </div>
    </n-card>
    <n-card title="Auto-import svg icon">
      <div>
        Normal: <svg-icons-cool />
      </div>
      <div>
        Large: <svg-icons-cool class="text-2em" />
      </div>
      <div>
        Very large: <svg-icons-cool class="text-4em" />
      </div>
      <div>
        nova-icon component loading: <nova-icon icon="local:cool" />
      </div>
    </n-card>
  </n-space>
</template>
