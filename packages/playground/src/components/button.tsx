import type { FlowProps } from 'solid-js'

export function Button(props: FlowProps<{ type: string }>) {
  return <button>{props.children}</button>
}
