import type { Orientation, Position } from '../mars/marsGrid.ts'

export interface RobotInput {
  start: Position
  instructionString: string
}

export interface MissionInput {
  maxX: number
  maxY: number
  robots: RobotInput[]
}

const GRID_LINE = /^(\d+)\s+(\d+)$/
const POSITION_LINE = /^(\d+)\s+(\d+)\s+([NESW])$/

// Each robot is a position line, optionally followed by an instruction line.
// Lines are told apart by their shape, so blank lines and missing instruction lines need no special handling.
export function parseInput(text: string): MissionInput {
  const [gridLine, ...robotLines] = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')

  const { maxX, maxY } = parseGridLine(gridLine)
  const robots: RobotInput[] = []

  for (const line of robotLines) {
    if (isPositionLine(line)) {
      robots.push({ start: parsePositionLine(line), instructionString: '' })
    } else {
      const robot = robots.at(-1)
      if (!robot || robot.instructionString !== '') {
        throw new Error(`Unexpected line: ${line}`)
      }
      robot.instructionString = line
    }
  }

  return { maxX, maxY, robots }
}

function parseGridLine(line: string | undefined): { maxX: number; maxY: number } {
  const match = line?.match(GRID_LINE)
  if (!match) {
    throw new Error(`Expected a grid line like "5 3", got: ${line ?? 'nothing'}`)
  }
  return { maxX: Number(match[1]), maxY: Number(match[2]) }
}

function isPositionLine(line: string): boolean {
  return POSITION_LINE.test(line)
}

function parsePositionLine(line: string): Position {
  const [, x, y, orientation] = line.match(POSITION_LINE)!
  return { x: Number(x), y: Number(y), orientation: orientation as Orientation }
}
