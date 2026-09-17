const PALETTE = ['#4F46E5', '#C8A24B', '#2563EB', '#16A34A', '#DC2626', '#7C3AED']

function colorFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function Avatar({
  name,
  initials,
  size = 32,
  presence,
}: {
  name: string
  initials: string
  size?: number
  presence?: 'active' | 'none'
}) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className="flex h-full w-full items-center justify-center rounded-full font-semibold text-white"
        style={{ backgroundColor: colorFor(name), fontSize: size * 0.4 }}
      >
        {initials}
      </span>
      {presence === 'active' && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-card bg-success"
          style={{ width: size * 0.32, height: size * 0.32 }}
        />
      )}
    </span>
  )
}
