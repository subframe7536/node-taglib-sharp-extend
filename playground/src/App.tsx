import { Show, Suspense, createSignal } from 'solid-js'
import { Info } from './info'
import { useMetadata } from './hook'

export function App() {
  const [file, setFile] = createSignal<File>()
  const [metadata, { download, updatePicture }] = useMetadata(file)
  function handleLoad(file: File) {
    setFile(file)
  }
  async function handleUpdatePicture(file: File) {
    await updatePicture(file)
  }
  function handleChange(target: EventTarget, cb: (file: File) => void) {
    const file = (target as HTMLInputElement)?.files?.[0]
    file && cb(file)
  }
  return (
    <>
      <div>
        <span>
          load file: <input
            type="file"
            onChange={({ target }) => handleChange(target, handleLoad)}
          />
        </span>
        <span>
          update picture: <input
            type="file"
            onChange={({ target }) => handleChange(target, handleUpdatePicture)}
          />
        </span>
        <span>
          <button onClick={download}>download</button>
        </span>
      </div>
      <Suspense fallback={<div>loading...</div>}>
        <Show when={metadata()}>
          {meta => <Info metadata={meta()} />}
        </Show>
      </Suspense>
    </>
  )
}
