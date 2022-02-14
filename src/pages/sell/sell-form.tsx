import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { Box, Stack } from "@mui/material"
import { PrepareOrderResponse } from "@rarible/sdk/build/types/order/common"
import { EthErc20AssetType, EthEthereumAssetType } from "@rarible/api-client"
import { toBigNumber, toContractAddress } from "@rarible/types"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"

function getCurrency() {
	const ethCurrency: EthEthereumAssetType = {
		"@type": "ETH"
	}

	const erc20Currency: EthErc20AssetType = {
		"@type": "ERC20",
		contract: toContractAddress("ETHEREUM:0xc778417E063141139Fce010982780140Aa0cD5Ab")
	}

	return ethCurrency
}

interface ISellFormProps {
	onComplete: (response: any) => void
	prepare: PrepareOrderResponse
}

export function SellForm({ prepare, onComplete }: ISellFormProps) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setError } = useRequestResult()

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}

				try {
					onComplete(await prepare.submit({
						price: toBigNumber(formData.price),
						amount: parseInt(formData.amount),
						currency: getCurrency()
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput
						type="number"
						inputProps={{ min: 0, step: "any" }}
						form={form}
						options={{
							min: 0
						}}
						name="price"
						label="Price"
					/>
					<FormTextInput
						type="number"
						inputProps={{ min: 1, max: prepare.maxAmount, step: 1 }}
						form={form}
						options={{
							min: 1,
							max: Number(prepare.maxAmount)
						}}
						defaultValue={Math.min(1, Number(prepare.maxAmount))}
						name="amount"
						label="Amount"
					/>
					<Box>
						<FormSubmit form={form} label="Submit" state={resultToState(result.type)}/>
					</Box>
				</Stack>
			</form>
			<Box sx={{ my: 2 }}>
				<RequestResult result={result}/>
			</Box>
		</>
	)
}
