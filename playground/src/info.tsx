import type { Metadata } from 'node-taglib-sharp-extend'
import { Entries } from '@solid-primitives/keyed'

type Props = {
  metadata: Omit<Metadata, 'pictures'> & { picture?: string }
}

export function Info(props: Props) {
  return (
    <div class="flex children:(flex-(~ col justify-center) color-blue-6)">
      <div>
        <div class="children:(max-w-100 max-h-100 overflow-scroll)">
          <Entries of={props.metadata.tag} fallback={<div>no tag</div>}>
            {(key, value) => (
              <div class="w-20">{key}: {value()}</div>
            )}
          </Entries>
        </div>
        <hr />
        <div>
          <Entries of={props.metadata.property}>
            {(key, accessor) => {
              const value = accessor()
              return Array.isArray(value)
                ? value.map(value => <div>{key}: {value}</div>)
                : <div>{key}: {value}</div>
            }}
          </Entries>
        </div>
      </div>
      <img
        src={props.metadata.picture}
        alt="no cover"
        class="w-90 h-90"
      />
    </div>
  )
}
