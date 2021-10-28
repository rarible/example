import { IRaribleSdk } from "@rarible/sdk/build/domain"
import React, { useCallback } from "react"
import { FormWithResult } from "../common/form-with-result"
import { FixedPrepareMintRequest, PrepareMintForm } from "./prepare-mint-form"
import { MintForm } from "./mint-form"
import { toUnionAddress } from "@rarible/types"

export function Mint({ sdk }: { sdk: IRaribleSdk }) {
	const prepare = useCallback(async (request: FixedPrepareMintRequest) => {
		//todo remove workaround after CORS fix
		if (request.collectionId === "ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82") {
			const fake = {"id":toUnionAddress("ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82"),"type":"ERC721","name":"Rarible","symbol":"RARI","features":["MINT_AND_TRANSFER","APPROVE_FOR_ALL"]}
			return sdk.nft.mint({ collection: fake as any })
		}
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

