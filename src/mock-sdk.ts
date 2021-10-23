import { IRaribleSdk } from "@rarible/sdk/build/domain"
import { toBigNumber, toOrderId } from "@rarible/types"
import { SellRequest } from "@rarible/sdk/build/order/sell/domain"
import { Action } from "@rarible/action"
import { FillRequest, OriginFeeSupport, PayoutsSupport } from "@rarible/sdk/build/order/fill/domain"
import { IBlockchainTransaction } from "@rarible/sdk-transaction"

const sellAction = Action
	.create({
		id: "send-tx" as const, run: async (req: SellRequest) => {
			await delay(2000)
			return toOrderId("fake-order-id")
		},
	})

const fillAction = Action
	.create({
		id: "send-tx" as const, run: async (req: FillRequest) => {
			await delay(2000)
			return new FakeBlockchainTransaction()
		}
	})

export const mockSdk: IRaribleSdk = {
	order: {
		sell: async () => {
			await delay(1000)
			return {
				maxAmount: toBigNumber("10"),
				submit: sellAction,
				baseFee: 0,
				supportedCurrencies: [],
			}
		},
		fill: async () => {
			await delay(1000)
			return {
				baseFee: 0,
				maxAmount: toBigNumber("100"),
				originFeeSupport: OriginFeeSupport.FULL,
				payoutsSupport: PayoutsSupport.MULTIPLE,
				supportsPartialFill: false,
				submit: fillAction,
			}
		},
		bid: null as any,
	},
	nft: null as any,
}

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

class FakeBlockchainTransaction implements IBlockchainTransaction<"ETHEREUM"> {
	blockchain: "ETHEREUM" = "ETHEREUM"
	transaction = null as any

	async wait() {
		await delay(3000)
		return null as any;
	}
}
