import { readFileSync } from 'node:fs'
import { parseInput } from './io/parseInput.ts'
import { runRobots } from './runRobots.ts'

const inputFile = process.argv[2]
if (!inputFile) {
  console.error('Usage: node martian-robots <input-file>')
  process.exit(1)
}

const parsedInstructions = parseInput(readFileSync(inputFile, 'utf8'))
console.log(runRobots(parsedInstructions))
