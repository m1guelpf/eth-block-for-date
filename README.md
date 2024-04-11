# Ethereum Block By Date

Get Ethereum block number by a given date, using [viem](https://viem.sh).

## Installation

```
bun i eth-block-for-date
```

## Usage

```typescript
import EthDater from 'eth-block-for-date'
import { createPublicClient, http } from 'viem'

const client = createPublicClient({ transport: http('YOUR_RPC_URL') })
const dater = new EthDater(client)

let block = await dater.getDate(
	new Date('2016-07-20T13:20:40Z'), // Date, required.
	true, // Block after, optional. Search for the nearest block before or after the given date. True by default.
	false // Refresh boundaries, optional. Recheck the latest block before request. False by default
)
```

If the given date is in the future, the script will return the latest block.

## License

This project is licensed under the MIT License. Check the [License file](LICENSE) for more info.
