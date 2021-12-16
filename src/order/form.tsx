import { toBigNumber } from "@rarible/types"
import { useState } from "react"
import {EthErc20AssetType, EthEthereumAssetType} from "@rarible/api-client/build/models/AssetType"
import { Input } from "../common/input"
import { FormProps } from "../common/form-props"
import { OrderRequest, PrepareOrderResponse } from "@rarible/sdk/build/types/order/common";
import {toContractAddress} from "@rarible/types/build/contract-address";

type SellFormProps = FormProps<OrderRequest> & {
	response: PrepareOrderResponse;
	currency: "ETH" | "WETH";
}

const ethCurrency: EthEthereumAssetType = {
	"@type": "ETH"
}

const erc20Currency: EthErc20AssetType = {
	"@type": "ERC20",
	contract: toContractAddress("ETHEREUM:0xc778417E063141139Fce010982780140Aa0cD5Ab")
}

export function OrderForm({ currency, onSubmit, response }: SellFormProps) {
	const [price, setPrice] = useState<string>("")
	const [amount, setAmount] = useState<string>("")
	const error = validate(price, amount, response)

	return (
		<div>
			<div>
				<Input value={price} onChange={setPrice} placeholder="Price"/>
			</div>
			<div>
				<Input value={amount} onChange={setAmount} placeholder="Amount"/>
			</div>
			<button
				onClick={() => onSubmit({
					amount: parseInt(amount),
					price: toBigNumber(price),
					currency: currency === "ETH" ? ethCurrency : erc20Currency,
				})}
				disabled={error !== undefined}
			>Submit</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	)
}

function validate(price: string, amount: string, prepareResponse: PrepareOrderResponse): string | undefined {
	const p = parseFloat(price)
	if (isNaN(p)) {
		return "price can not be parsed"
	}
	const a = parseInt(amount)
	if (isNaN(a)) {
		return "amount can not be parsed"
	}
	//todo should this be number?
	if (a > parseInt(prepareResponse.maxAmount)) {
		return `max amount: ${prepareResponse.maxAmount}`
	}
	return undefined
}
