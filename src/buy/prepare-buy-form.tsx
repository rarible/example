import { FormProps } from "../common/form-props"
import { PrepareFillRequest } from "@rarible/sdk/build/types/order/fill/domain"
import {PrepareFillForm} from "../common/fill/prepare-fill-form";

export function PrepareBuyForm({ onSubmit }: FormProps<PrepareFillRequest>) {
	return (
		<div>
			<PrepareFillForm onSubmit={onSubmit}/>
			<p>
				Enter Sell Order Id in the input and press Submit to buy.
			</p>
		</div>
	)
}
