import { useState } from "react"
import { Input } from "../input"
import { FormProps } from "../form-props"
import {FillRequest, PrepareFillResponse} from "@rarible/sdk/build/types/order/fill/domain"
import {validate} from "./fill-form-validator";

type SubmitFillFormProps = FormProps<FillRequest> & {
	response: PrepareFillResponse
}

export function SubmitFillForm({ onSubmit, response }: SubmitFillFormProps) {
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