import { useState } from "react"
import { Input } from "../common/input"
import { FormProps } from "../common/form-props"
import { FillRequest, PrepareFillResponse } from "@rarible/sdk/build/order/fill/domain"

type FillFormProps = FormProps<FillRequest> & {
	response: PrepareFillResponse
}

export function FillForm({ onSubmit, response }: FillFormProps) {
	const [amount, setAmount] = useState<string>("")
	const error = validate(amount, response)

	return (
		<div>
			<div>
				<Input value={amount} onChange={setAmount} placeholder="Amount"/>
			</div>
			<button
				onClick={() => onSubmit({ amount: parseInt(amount) })}
				disabled={error !== undefined}
			>Submit</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	)
}

function validate(amount: string, prepareResponse: PrepareFillResponse): string | undefined {
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
