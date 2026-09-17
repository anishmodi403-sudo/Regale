import type { PromiseTier, RequestType, ServiceRequest } from '../types'

/** Templates a trickle-in request is drawn from (Iteration 2 §1) — the
 * board would otherwise only age forward and eventually decay to
 * all-breached in a long-running session, since nothing new ever arrives
 * to replenish To Do. Mirrors the flavor of the seed data. */
interface RequestTemplate {
  type: RequestType
  item: string
  itemsCount: number
  promiseTier: PromiseTier
  promiseMinutes: number
}

const TEMPLATES: RequestTemplate[] = [
  { type: 'Supplies', item: 'Bath Towels', itemsCount: 2, promiseTier: 'standard', promiseMinutes: 20 },
  { type: 'Supplies', item: 'Toiletries', itemsCount: 3, promiseTier: 'standard', promiseMinutes: 22 },
  { type: 'Supplies', item: 'Extra Pillows', itemsCount: 2, promiseTier: 'standard', promiseMinutes: 18 },
  { type: 'Meal Request', item: 'Club Sandwich', itemsCount: 1, promiseTier: 'standard', promiseMinutes: 25 },
  { type: 'Meal Request', item: 'Veg Biryani', itemsCount: 1, promiseTier: 'standard', promiseMinutes: 28 },
  { type: 'Meal Request', item: 'Pancakes', itemsCount: 2, promiseTier: 'priority', promiseMinutes: 12 },
  { type: 'Meal Request', item: 'Butter Naan', itemsCount: 3, promiseTier: 'standard', promiseMinutes: 24 },
  { type: 'Beverage', item: 'Filter Coffee', itemsCount: 2, promiseTier: 'standard', promiseMinutes: 18 },
  { type: 'Beverage', item: 'Fresh Lime Soda', itemsCount: 1, promiseTier: 'priority', promiseMinutes: 10 },
  { type: 'Beverage', item: 'Masala Chai', itemsCount: 2, promiseTier: 'standard', promiseMinutes: 20 },
  { type: 'Room Task', item: 'Turndown Service', itemsCount: 1, promiseTier: 'standard', promiseMinutes: 26 },
  { type: 'Room Task', item: 'AC Repair', itemsCount: 1, promiseTier: 'priority', promiseMinutes: 15 },
  { type: 'Room Task', item: 'Room Cleaning', itemsCount: 1, promiseTier: 'standard', promiseMinutes: 30 },
  { type: 'Pickup', item: 'Clear Tray', itemsCount: 1, promiseTier: 'standard', promiseMinutes: 20 },
  { type: 'Pickup', item: 'Luggage Down', itemsCount: 2, promiseTier: 'priority', promiseMinutes: 12 },
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateFreshRequest(seq: number): ServiceRequest {
  const template = TEMPLATES[randomInt(0, TEMPLATES.length - 1)]
  const floor = randomInt(1, 12)
  const room = String(floor * 100 + randomInt(1, 20))
  const requestedAt = Date.now()

  return {
    id: String(seq),
    floor,
    room,
    code: `RG-${seq}`,
    type: template.type,
    item: template.item,
    itemsCount: template.itemsCount,
    requestedAt,
    promiseMinutes: template.promiseMinutes,
    promiseTier: template.promiseTier,
    progressState: 'accepted',
    acceptedAt: requestedAt,
  }
}
