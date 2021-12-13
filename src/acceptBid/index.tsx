import { IRaribleSdk } from "@rarible/sdk/build/domain"
import React from "react"
import {FormWithResult} from "../common/form-with-result";
import {PrepareAcceptBidForm} from "./prepare-acceptbid-form";
import {SubmitFillForm} from "../common/fill/submit-fill-form";

export function AcceptBid({ sdk }: { sdk: IRaribleSdk }) {
	return (
		<FormWithResult
			renderForm={onSubmit => <PrepareAcceptBidForm onSubmit={onSubmit}/>}
			process={sdk.order.acceptBid}
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
