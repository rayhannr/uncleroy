import remarkClassNames from "remark-class-names";
const classMap = {
  paragraph: "my-2 first:mt-0 last:mb-0",
};

export default function htmlClassNames() {
  return remarkClassNames({ classMap });
}
