import { useState } from "react"
import { toOrderId } from "@rarible/types"
import { Input } from "../input"
import { FormProps } from "../form-props"
import { PrepareFillRequest } from "@rarible/sdk/build/types/order/fill/domain"

export function PrepareFillForm({ onSubmit }: FormProps<PrepareFillRequest>) {
	const [orderId, setOrderId] = useState("")

	return (
		<>
			<div>
				<Input
					value={orderId}
					onChange={setOrderId}
					placeholder="Order Id (ex: ETHEREUM:0xc34c39aa3a83afdd35cb65351710cfc56a85c9f410cfc56a85c9f49aa3a83af4)"
				/>
			</div>
			<button onClick={() => onSubmit({ orderId: toOrderId(orderId) })}>Submit</button>
		</>
	)
}
