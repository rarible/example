import { useState } from "react"
import { toOrderId } from "@rarible/types"
import { Input } from "../common/input"
import { FormProps } from "../common/form-props"
import { PrepareFillRequest } from "@rarible/sdk/build/order/fill/domain"

export function PrepareFillForm({ onSubmit }: FormProps<PrepareFillRequest>) {
	const [orderId, setOrderId] = useState("")
	return (
		<div>
			<div>
				<Input
					value={orderId}
					onChange={setOrderId}
					placeholder="Order Id (ex: ETHEREUM:0xc34c39aa3a83afdd35cb65351710cfc56a85c9f4)"
				/>
			</div>
			<button onClick={() => onSubmit({ orderId: toOrderId(orderId) })}>Submit</button>
			<p>
				Enter Order Id in the input and press Submit to fill this order (buy or accept bid)
			</p>
		</div>
	)
}
