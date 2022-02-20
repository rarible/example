import { IRaribleSdk } from "@rarible/sdk/build/domain"
import React, { useCallback } from "react"
import { FormWithResult } from "../common/form-with-result"
import { CollectionDeployForm } from "./collection-deploy-form";
import { CreateCollectionRequest } from "@rarible/sdk/build/types/nft/deploy/domain";

export function Collection({ sdk }: { sdk: IRaribleSdk }) {
	const prepare = useCallback(async (request: CreateCollectionRequest) => {
		return sdk.nft.deploy(request)
	}, [sdk])

	return (
		<FormWithResult
			process={prepare}
			renderForm={onSubmit => <CollectionDeployForm onSubmit={onSubmit}/>}
		>
			{(response) => {
				return <>
					<p>Collection address: {response.address}</p>
					<p>Transaction info:</p>
					<code style={{
						display: "block",
						fontFamily: "monospace",
						whiteSpace: "break-spaces",
						wordBreak: "break-word",
						textAlign: "left",
						margin: "0 auto",
						maxWidth: "80%"
					}}>
						{JSON.stringify(response.tx.transaction, null, " ")}
					</code>
				</>
			}}
		</FormWithResult>
	)
}

