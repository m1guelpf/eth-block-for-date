import type { GetBlockParameters, PublicClient } from 'viem'
import { fromUnixTime, getUnixTime, isBefore, differenceInSeconds } from 'date-fns'

export type Block = {
	number: bigint
	timestamp: number
}

class EthDater {
	public requests = 0
	private client: PublicClient
	private firstBlock: Block | undefined
	private blockTime: number | undefined
	private latestBlock: Block | undefined
	private savedBlocks: Record<string, Block> = {}
	private checkedBlocks: Record<number, bigint[]> = {}

	constructor(client: PublicClient) {
		this.client = client
	}

	async #getBoundaries() {
		this.firstBlock = await this.#getBlock({ blockNumber: 1n })
		this.latestBlock = await this.#getBlock({ blockTag: 'latest' })

		this.blockTime =
			(this.latestBlock.timestamp - this.firstBlock.timestamp) / (Number(this.latestBlock.number!) - 1)
	}

	public async getBlock(date: Date, after = true, refresh = false): Promise<Block> {
		if (refresh || this.firstBlock == undefined || this.latestBlock == undefined || this.blockTime == undefined) {
			await this.#getBoundaries()
		}

		if (isBefore(date, fromUnixTime(this.firstBlock!.timestamp))) {
			return this.firstBlock!
		}

		if (isSameOrAfter(date, fromUnixTime(this.latestBlock!.timestamp))) {
			return this.latestBlock!
		}

		this.checkedBlocks[getUnixTime(date)] = []

		return await this.#findBetter(
			date,
			await this.#getBlock({
				blockNumber: BigInt(
					Math.ceil(differenceInSeconds(date, fromUnixTime(this.firstBlock!.timestamp)) / this.blockTime!)
				),
			}),
			after,
			this.blockTime!
		)
	}

	async #findBetter(date: Date, predictedBlock: Block, after: boolean, blockTime: number): Promise<Block> {
		if (await this.#isBetterBlock(date, predictedBlock, after)) return predictedBlock

		let difference = differenceInSeconds(date, fromUnixTime(predictedBlock.timestamp))
		let skip = Math.ceil(difference / (blockTime == 0 ? 1 : blockTime))
		if (skip == 0) skip = difference < 0 ? -1 : 1

		let nextPredictedBlock = await this.#getBlock({
			blockNumber: this.#getNextBlock(date, predictedBlock.number, skip),
		})
		blockTime = Math.abs(
			(predictedBlock.timestamp - nextPredictedBlock.timestamp) /
				Number(predictedBlock.number - nextPredictedBlock.number)
		)

		return this.#findBetter(date, nextPredictedBlock, after, blockTime)
	}

	async #isBetterBlock(date: Date, predictedBlock: Block, after: boolean) {
		let blockTime = fromUnixTime(predictedBlock.timestamp)

		if (after) {
			if (isBefore(blockTime, date)) return false
			let previousBlock = await this.#getBlock({ blockNumber: predictedBlock.number - 1n })
			if (isSameOrAfter(blockTime, date) && isBefore(fromUnixTime(previousBlock.timestamp), date)) return true
		} else {
			if (isSameOrAfter(blockTime, date)) return false
			let nextBlock = await this.#getBlock({ blockNumber: predictedBlock.number + 1n })
			if (isBefore(blockTime, date) && isSameOrAfter(fromUnixTime(nextBlock.timestamp), date)) return true
		}

		return false
	}

	#getNextBlock(date: Date, currentBlock: bigint, skip: number): bigint {
		let nextBlock = currentBlock + BigInt(skip)
		if (nextBlock > this.latestBlock!.number) nextBlock = this.latestBlock!.number

		if (this.checkedBlocks[getUnixTime(date)]!.includes(nextBlock)) {
			return this.#getNextBlock(date, currentBlock, skip < 0 ? --skip : ++skip)
		}

		this.checkedBlocks[getUnixTime(date)]!.push(nextBlock)

		return nextBlock < 1 ? 1n : nextBlock
	}

	async #getBlock(block: GetBlockParameters): Promise<Block> {
		const blockIndex = block.blockTag || block.blockHash || block.blockNumber!.toString()

		if (this.savedBlocks[blockIndex]) return this.savedBlocks[blockIndex]!

		const { number, timestamp } = await this.client.getBlock(block)
		this.savedBlocks[blockIndex] = { timestamp: Number(timestamp), number: number! }

		this.requests++
		return this.savedBlocks[blockIndex]!
	}
}

const isSameOrAfter = (date: Date, dateToCompare: Date) => date.getTime() >= dateToCompare.getTime()

export default EthDater
