// eslint.config.js
import antfu from '@antfu/eslint-config'

// https://github.com/antfu/eslint-config
export default antfu(
  {
    typescript: {
      overrides: {
        'perfectionist/sort-exports': 'off',
        'perfectionist/sort-imports': 'off',
        'ts/no-unused-expressions': ['error', { allowShortCircuit: true }],
      },
    },
    vue: {
      overrides: {
        'vue/no-unused-refs': 'off', // Close temporarily, waiting for vue-lint branch to merge
        'vue/no-reserved-component-names': 'off',
        'vue/component-definition-name-casing': 'off',
        "no-undef": "off",
        "no-unused-vars": "off",
        "vue/no-v-html": "off",
        "vue/require-default-prop": "off",
        "vue/require-explicit-emits": "off",
        "vue/multi-word-component-names": "off",
        "vue/no-setup-props-reactivity-loss": "off",
      },
    },
  },
)
