import remarkClassNames from 'remark-class-names'
const classMap = {
  'paragraph inlineCode': 'text-neutral-950 dark:text-neutral-50 font-mono'
}

export function htmlClassNames() {
  return remarkClassNames({ classMap })
}
