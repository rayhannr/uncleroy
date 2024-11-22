import remarkClassNames from 'remark-class-names'
const classMap = {
  'paragraph inlineCode': 'text-neutral-950 dark:text-neutral-100'
}

export default function htmlClassNames() {
  return remarkClassNames({ classMap })
}
