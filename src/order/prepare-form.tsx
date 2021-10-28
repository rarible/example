import { useState } from "react"
import { toItemId } from "@rarible/types"
import { Input } from "../common/input"
import { FormProps } from "../common/form-props"
import { PrepareOrderRequest } from "@rarible/sdk/build/order/common"

export function PrepareForm({ onSubmit }: FormProps<PrepareOrderRequest>) {
	const [itemId, setItemId] = useState("")
	return (
		<div>
			<div>
				<Input
					value={itemId}
					onChange={setItemId}
					placeholder="Item Id (ex: ETHEREUM:0xc34c39aa3a83afdd35cb65351710cfc56a85c9f4:10121312)"
				/>
			</div>
			<button onClick={() => onSubmit({ itemId: toItemId(itemId) })}>Submit</button>
			<p>
				Enter Item Id in the input and press Submit
			</p>
		</div>
	)
}
