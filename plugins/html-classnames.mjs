import remarkClassNames from 'remark-class-names'
const classMap = {
  'paragraph inlineCode': 'text-blue-600 dark:text-sky-500'
}

export default function htmlClassNames() {
  return remarkClassNames({ classMap })
}
