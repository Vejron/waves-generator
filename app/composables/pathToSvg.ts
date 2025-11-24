export const usePathToSvg = (
  path: MaybeRef<string>,
  width: MaybeRef<number>,
  height: MaybeRef<number>
) => {

  const topMask = computed(() => {
    const w = unref(width)
    const h = unref(height)
    const p = unref(path)
    return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><path d="${encodeURI(p)}"/></svg>')`;
  })

  const bottomMask = computed(() => {
    const w = unref(width)
    const h = unref(height)
    const p = enclosePathAbove(unref(path), w, h);
    return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><path d="${encodeURI(p)}"/></svg>')`;
  })

  return { topMask, bottomMask }
}
