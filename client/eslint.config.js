import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      'vue/attributes-order': [
        'error',
        {
          order: [
            'DEFINITION', // v-is
            'LIST_RENDERING', // v-for
            'CONDITIONALS', // v-if, v-else-if, v-else, v-show, v-cloak
            'RENDER_MODIFIERS', // v-once, v-pre
            'GLOBAL', // id, key, ref
            'UNIQUE', // slot, v-slot, is
            'TWO_WAY_BINDING', // v-model
            'OTHER_DIRECTIVES', // Custom directives
            'OTHER_ATTR', // class, style
            'EVENTS', // @click, @input
            'CONTENT', // v-text, v-html
          ],
        },
      ],
    },
  },
  skipFormatting,
]
