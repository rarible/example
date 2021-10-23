import { IRaribleSdk } from "@rarible/sdk/build/domain"
import React from "react"
import { PrepareSellForm } from "./prepare-sell-form"
import { SellForm } from "./sell-form"
import { FormWithResult } from "../common/form-with-result"

export function Sell({ sdk }: { sdk: IRaribleSdk }) {
	return (
		<FormWithResult
			renderForm={onSubmit => <PrepareSellForm onSubmit={onSubmit}/>}
			process={sdk.order.sell}
		>{prepareResponse => (
			<FormWithResult
				renderForm={onSubmit => <SellForm onSubmit={onSubmit} response={prepareResponse}/>}
				process={prepareResponse.submit}
			>{orderId => <p>{orderId}</p>}</FormWithResult>
		)}</FormWithResult>
	)
}
