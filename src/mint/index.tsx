import { IRaribleSdk } from "@rarible/sdk/build/domain"
import React, { useCallback } from "react"
import { FormWithResult } from "../common/form-with-result"
import { FixedPrepareMintRequest, PrepareMintForm } from "./prepare-mint-form"
import { MintForm } from "./mint-form"

export function Mint({ sdk }: { sdk: IRaribleSdk }) {
	const prepare = useCallback(async (request: FixedPrepareMintRequest) => {
		const collection = await sdk.apis.collection.getCollectionById({ collection: request.collectionId })
		return sdk.nft.mint({ collection })
	}, [sdk])

	return (
		<FormWithResult
			renderForm={onSubmit => <PrepareMintForm onSubmit={onSubmit}/>}
			process={prepare}
		>{prepareResponse => (
			<FormWithResult
				process={prepareResponse.submit}
				renderForm={onSubmit => <MintForm onSubmit={onSubmit} response={prepareResponse}/>}
			>
				{response => <p>{response.type} - {response.itemId}</p>}
			</FormWithResult>
		)}</FormWithResult>
	)
}

