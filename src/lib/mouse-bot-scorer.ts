export interface MouseSample {
  x: number
  y: number
  t: number
}

export interface MouseFeatures {
  meanVelocity: number
  stdVelocity: number
  meanAcceleration: number
  straightness: number   // displacement / path-length  (1 = perfectly straight)
  angleChanges: number   // mean absolute direction change in radians
}

export function extractFeatures(samples: MouseSample[]): MouseFeatures | null {
  if (samples.length < 5) return null

  const velocities: number[] = []
  const accelerations: number[] = []
  const angles: number[] = []

  for (let i = 1; i < samples.length; i++) {
    const dx = samples[i].x - samples[i - 1].x
    const dy = samples[i].y - samples[i - 1].y
    const dt = Math.max(samples[i].t - samples[i - 1].t, 1)
    const dist = Math.hypot(dx, dy)
    velocities.push(dist / dt)
    angles.push(Math.atan2(dy, dx))
  }

  for (let i = 1; i < velocities.length; i++) {
    accelerations.push(Math.abs(velocities[i] - velocities[i - 1]))
  }

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const std = (arr: number[], m: number) =>
    Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length)

  const mv = mean(velocities)

  const angleChanges = angles.slice(1).map((a, i) => {
    let delta = Math.abs(a - angles[i])
    if (delta > Math.PI) delta = 2 * Math.PI - delta
    return delta
  })

  const first = samples[0]
  const last = samples[samples.length - 1]
  const displacement = Math.hypot(last.x - first.x, last.y - first.y)
  // velocities[i] = dist(samples[i], samples[i+1]) / dt(i, i+1)
  // so velocities[i] * dt(i, i+1) = dist — reconstructing segment length
  const pathLength = velocities.reduce((a, b, i) => {
    const dt = Math.max(samples[i + 1].t - samples[i].t, 1)
    return a + b * dt
  }, 0)
  const straightness = pathLength > 0 ? Math.min(displacement / pathLength, 1) : 1

  return {
    meanVelocity: mv,
    stdVelocity: std(velocities, mv),
    meanAcceleration: accelerations.length ? mean(accelerations) : 0,
    straightness,
    angleChanges: angleChanges.length ? mean(angleChanges) : 0,
  }
}

/**
 * Returns a bot probability score in [0, 1].
 * Threshold for blocking: >= 0.7
 *
 * Heuristics based on DELBOT-Mouse paper features:
 *  - Real users have varied velocity (high std) and irregular angle changes
 *  - Bots move in straight lines at constant speed
 */
export function scoreBotProbability(f: MouseFeatures): number {
  let score = 0

  // Very high straightness → bot-like
  if (f.straightness > 0.97) score += 0.35

  // Near-zero velocity variance → constant speed → bot-like
  const velocityCV = f.meanVelocity > 0 ? f.stdVelocity / f.meanVelocity : 0
  if (velocityCV < 0.1) score += 0.35

  // Very low angle changes → straight-line movement → bot-like
  if (f.angleChanges < 0.05) score += 0.20

  // Near-zero acceleration → no natural hesitation → bot-like
  if (f.meanAcceleration < 0.01) score += 0.10

  return Math.min(score, 1)
}

export const BOT_SCORE_THRESHOLD = 0.7
