import React, { useContext } from "react"
import { Box, MenuItem, Stack, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { Blockchain } from "@rarible/api-client"
import { DeploySupportedBlockchains, DeployTokenRequest } from "@rarible/sdk/build/types/nft/deploy/domain"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { FormSelect } from "../../components/common/form/form-select"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { FormCheckbox } from "../../components/common/form/form-checkbox"
import { CollectionDeployComment } from "./comments/collection-deploy-comment"
import { RequestResult } from "../../components/common/request-result"
import { Code } from "../../components/common/code"
import { InlineCode } from "../../components/common/inline-code"
import { CollectionResultComment } from "./comments/collection-result-comment"
import { CopyToClipboard } from "../../components/common/copy-to-clipboard"
import { TransactionInfo } from "../../components/common/transaction-info"

function getDeployRequest(data: Record<string, any>) {
	switch (data["blockchain"]) {
		case Blockchain.POLYGON:
		case Blockchain.ETHEREUM:
			return {
				blockchain: data["blockchain"] as DeploySupportedBlockchains,
				asset: {
					assetType: "ERC721",
					arguments: {
						name: data["name"],
						symbol: data["symbol"],
						baseURI: data["baseURI"],
						contractURI: data["contractURI"],
						isUserToken: false
					}
				}
			} as DeployTokenRequest
		case Blockchain.TEZOS:
			return {
				blockchain: data["blockchain"] as DeploySupportedBlockchains,
				asset: {
					assetType: "NFT",
					arguments: {
						name: data["name"],
						symbol: data["symbol"],
						contractURI: data["contractURI"],
						isUserToken: false,
					},
				},
			} as DeployTokenRequest
		default:
			throw new Error("Unsupported blockchain")
	}
}


export function DeployPage() {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setComplete, setError } = useRequestResult()

	return (
		<Page header="Deploy Collection">
			<CommentedBlock sx={{ my: 2 }} comment={<CollectionDeployComment/>}>
				<form onSubmit={handleSubmit(async (formData) => {
					try {
						setComplete(await connection.sdk?.nft.deploy(getDeployRequest(formData)))
					} catch (e) {
						setError(e)
					}
				})}
				>
					<Stack spacing={2}>
						<FormSelect form={form} defaultValue={Blockchain.ETHEREUM} name="blockchain" label="Blockchain">
							<MenuItem value={Blockchain.ETHEREUM}>{Blockchain.ETHEREUM}</MenuItem>
							<MenuItem value={Blockchain.POLYGON}>{Blockchain.POLYGON}</MenuItem>
							<MenuItem value={Blockchain.TEZOS}>{Blockchain.TEZOS}</MenuItem>
						</FormSelect>
						<FormTextInput form={form} name="name" label="Name"/>
						<FormTextInput form={form} name="symbol" label="Symbol"/>
						<FormTextInput form={form} name="baseURI" label="Base URI"/>
						<FormTextInput form={form} name="contractURI" label="Contract URI"/>
						<FormCheckbox form={form} name="private" label="Private Collection"/>
						<Box>
							<FormSubmit form={form} label="Deploy" state={resultToState(result.type)}/>
						</Box>
					</Stack>
				</form>
			</CommentedBlock>

			<CommentedBlock sx={{ my: 2 }} comment={result.type === "complete" ? <CollectionResultComment/> : null}>
				<RequestResult
					result={result}
					completeRender={(data) =>
						<>
							<Box sx={{ my: 2 }}>
								<Typography variant="overline">Collection Address:</Typography>
								<div>
									<InlineCode>{data.address}</InlineCode> <CopyToClipboard value={data.address}/>
								</div>
							</Box>
							<Box sx={{ my: 2 }}>
								<TransactionInfo transaction={data.tx}/>
							</Box>
						</>
					}
				/>
			</CommentedBlock>
		</Page>
	)
}
