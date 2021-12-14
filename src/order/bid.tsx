import { IRaribleSdk } from "@rarible/sdk/build/domain"
import React from "react"
import { FormWithResult } from "../common/form-with-result"
import { PrepareForm } from "./prepare-form"
import { OrderForm } from "./form"

export function Bid({ sdk }: { sdk: IRaribleSdk }) {
	return (
		<FormWithResult
			renderForm={onSubmit => <PrepareForm onSubmit={onSubmit}/>}
			process={sdk.order.bid}
		>{prepareResponse => (
			<FormWithResult
				renderForm={onSubmit => <OrderForm currency="WETH" onSubmit={onSubmit} response={prepareResponse}/>}
				process={prepareResponse.submit}
			>{orderId => <p>{orderId}</p>}</FormWithResult>
		)}</FormWithResult>
	)
}
