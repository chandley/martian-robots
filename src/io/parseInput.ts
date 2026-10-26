import { INSTRUCTIONS, type GridSize, type Orientation, type Position } from '../mars/marsGrid.ts'
import type { RobotOrders } from '../addAndMoveRobots.ts'

export interface MissionInput {
  gridSize: GridSize
  robotOrders: RobotOrders[]
}

export class InputError extends Error {
  readonly lineNumber: number

  constructor(lineNumber: number, message: string) {
    super(message)
    this.name = 'InputError'
    this.lineNumber = lineNumber
  }
}

export const MAX_COORDINATE = 50
export const MAX_INSTRUCTION_LENGTH = 100
export const MAX_ROBOTS = 1000

interface Line {
  number: number
  text: string
}

const GRID_LINE = /^(\d+)\s+(\d+)$/
const POSITION_LINE = /^(\d+)\s+(\d+)\s+(\S+)$/
const ORIENTATIONS = ['N', 'E', 'S', 'W']

// Each robot is a position line, optionally followed by an instruction line.
// A line starting with a digit or minus sign is a position line; any other line is an instruction line.
// Any bad line rejects the whole input with an InputError naming that line.
export function parseInput(text: string): MissionInput {
  const [gridLine, ...robotLines] = text
    .split('\n')
    .map((line, index) => ({ number: index + 1, text: line.trim() }))
    .filter(line => line.text !== '')

  const gridSize = parseGridLine(gridLine)
  const robotOrders: RobotOrders[] = []

  for (const line of robotLines) {
    if (isPositionLine(line)) {
      if (robotOrders.length === MAX_ROBOTS) {
        throw new InputError(line.number, `no more than ${MAX_ROBOTS} robots are allowed`)
      }
      robotOrders.push({ startPosition: parsePositionLine(line, gridSize), instructionString: '' })
    } else {
      const robot = robotOrders.at(-1)
      if (!robot || robot.instructionString !== '') {
        throw new InputError(line.number, 'expected a robot position line like "1 1 E" before this instruction line')
      }
      robot.instructionString = parseInstructionLine(line)
    }
  }

  return { gridSize, robotOrders }
}

function parseGridLine(line: Line | undefined): GridSize {
  const match = line?.text.match(GRID_LINE)
  if (!line || !match) {
    throw new InputError(line?.number ?? 1, 'expected a grid line of two whole numbers, like "5 3"')
  }
  const maxX = Number(match[1])
  const maxY = Number(match[2])
  if (maxX > MAX_COORDINATE || maxY > MAX_COORDINATE) {
    throw new InputError(line.number, `grid coordinates must be ${MAX_COORDINATE} or less`)
  }
  return { maxX, maxY }
}

function isPositionLine({ text }: Line): boolean {
  return /^[-\d]/.test(text)
}

function parsePositionLine(line: Line, { maxX, maxY }: GridSize): Position {
  const match = line.text.match(POSITION_LINE)
  if (!match) {
    throw new InputError(line.number, 'expected a robot position of two whole numbers and an orientation, like "1 1 E"')
  }
  const [, x, y, orientation] = match
  if (!ORIENTATIONS.includes(orientation)) {
    throw new InputError(line.number, `orientation must be one of ${ORIENTATIONS.join(', ')}, got "${orientation}"`)
  }
  const position = { x: Number(x), y: Number(y), orientation: orientation as Orientation }
  if (position.x > maxX || position.y > maxY) {
    throw new InputError(line.number, `robot starts off the grid (the grid is 0 0 to ${maxX} ${maxY})`)
  }
  return position
}

function parseInstructionLine({ number, text }: Line): string {
  if (text.length > MAX_INSTRUCTION_LENGTH) {
    throw new InputError(number, `an instruction line can be at most ${MAX_INSTRUCTION_LENGTH} letters long`)
  }
  const unknown = [...text].find(letter => !INSTRUCTIONS.includes(letter))
  if (unknown) {
    throw new InputError(number, `unknown instruction "${unknown}" (allowed: ${INSTRUCTIONS.join(', ')})`)
  }
  return text
}
