import { IRaribleSdk } from "@rarible/sdk/build/domain"
import React from "react"
import { FormWithResult } from "../common/form-with-result"
import { PrepareFillForm } from "./prepare-fill-form"

export function Fill({ sdk }: { sdk: IRaribleSdk }) {
	return (
		<FormWithResult
			renderForm={onSubmit => <PrepareFillForm onSubmit={onSubmit}/>}
			process={sdk.order.fill}
		>{prepareResponse => (
			<p>prepapred</p>
		)}</FormWithResult>
	)
}
