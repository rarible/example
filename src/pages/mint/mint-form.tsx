import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { Box, Stack } from "@mui/material"
import { MintResponse, PrepareMintResponse } from "@rarible/sdk/build/types/nft/mint/domain"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { FormCheckbox } from "../../components/common/form/form-checkbox"
import { RequestResult } from "../../components/common/request-result"


interface IMintFormProps {
	onComplete: (response: MintResponse) => void
	prepare: PrepareMintResponse
}

export function MintForm({ prepare, onComplete }: IMintFormProps) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setError } = useRequestResult()

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}

				try {
					onComplete(await prepare.submit({
						uri: formData.metadataUri,
						supply: formData.supply ?? 1,
						lazyMint: formData.lazy ?? false
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput form={form} name="metadataUri" label="Metadata URI"/>
					<FormTextInput
						type="number"
						form={form}
						name="supply"
						label="Supply"
						defaultValue={1}
						disabled={!prepare.multiple}
						helperText={!prepare.multiple ? "Collection does not support multiple mint" : null}
					/>
					<FormCheckbox
						form={form}
						name="lazy"
						label="Lazy-mint"
						disabled={!prepare.supportsLazyMint}
						//helperText={!prepareResponse.multiple ? "Collection does not support multiple mint" : null}
					/>
					<Box>
						<FormSubmit form={form} label="Submit" state={resultToState(result.type)}/>
					</Box>
				</Stack>
			</form>
			<Box sx={{ my: 2 }}>
				<RequestResult result={result}/>
			</Box>
		</>
	)
}
