import { FormProps } from "../common/form-props"
import { PrepareFillRequest } from "@rarible/sdk/build/types/order/fill/domain"
import {PrepareFillForm} from "../common/fill/prepare-fill-form";

export function PrepareAcceptBidForm({ onSubmit }: FormProps<PrepareFillRequest>) {
	return (
		<div>
			<PrepareFillForm onSubmit={onSubmit}/>
			<p>
				Enter Bid Order Id in the input and press Submit to accept bid.
			</p>
		</div>
	)
}
