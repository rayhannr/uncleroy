import remarkClassNames from 'remark-class-names'
const classMap = {
  paragraph: 'my-8 leading-6 text-pretty tracking-wide first:mt-0 last:mb-0'
}

export default function htmlClassNames() {
  return remarkClassNames({ classMap })
}
