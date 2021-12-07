import { IRaribleSdk } from "@rarible/sdk/build/domain"
import React, { useCallback } from "react"
import { FormWithResult } from "../common/form-with-result"
import { CollectionDeployForm } from "./collection-deploy-form";
import { DeployTokenRequest } from "@rarible/sdk/build/types/nft/deploy/domain";

export function Collection({ sdk }: { sdk: IRaribleSdk }) {
	const prepare = useCallback(async (request: DeployTokenRequest) => {
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
					<code style={{fontFamily: "monospace"}}>
						hash: {response.tx.transaction.hash}<br/>
						from: {response.tx.transaction.from}<br/>
						to: {response.tx.transaction.to}<br/>
						nonce: {response.tx.transaction.nonce}<br/>
					</code>
				</>
			}}
		</FormWithResult>
	)
}

