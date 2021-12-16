import { IRaribleSdk } from "@rarible/sdk/build/domain"
import React from "react"
import {FormWithResult} from "../common/form-with-result";
import {SubmitFillForm} from "../common/fill/submit-fill-form";
import {PrepareBuyForm} from "./prepare-buy-form";

export function Buy({ sdk }: { sdk: IRaribleSdk }) {
	return (
		<FormWithResult
			renderForm={onSubmit => <PrepareBuyForm onSubmit={onSubmit}/>}
			process={sdk.order.buy}
		>{prepareResponse => (
			<FormWithResult
				process={prepareResponse.submit}
				renderForm={onSubmit => <SubmitFillForm onSubmit={onSubmit} response={prepareResponse}/>}
			>
				{response => <p>{JSON.stringify(response)}</p>}
			</FormWithResult>
		)}</FormWithResult>
	)
}
