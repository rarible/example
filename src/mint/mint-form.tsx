import { useState } from "react"
import { Input } from "../common/input"
import { FormProps } from "../common/form-props"
import { Checkbox } from "../common/checkbox"
import { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import { PrepareMintResponse } from "@rarible/sdk/build/types/nft/mint/domain"

type MintFormProps = FormProps<MintRequest> & {
	response: PrepareMintResponse
}

//todo we should support here full url
export function MintForm({ onSubmit, response }: MintFormProps) {
	const [uri, setUri] = useState<string>("ipfs://QmWLsBu6nS4ovaHbGAXprD1qEssJu4r5taQfB74sCG51tp")
	const [supply, setSupply] = useState<string>("1")
	const [lazy, setLazy] = useState<boolean>(true)
	const error = validate(uri, supply, response)

	return (
		<div>
			<div>
				<Input value={uri} onChange={setUri} placeholder="Metadata URI"/>
			</div>
			{
				response.multiple && (
					<div>
						<Input value={supply} onChange={setSupply} placeholder="Supply"/>
					</div>
				)
			}
			{
				response.supportsLazyMint && (
					<div>
						<Checkbox value={lazy} onChange={setLazy} label="Lazy-mint"/>
					</div>
				)
			}
			<button
				onClick={() => onSubmit({ uri, supply: parseInt(supply) || 1, lazyMint: response.supportsLazyMint && lazy })}
				disabled={error !== undefined}
			>Submit</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	)
}

function validate(uri: string, supply: string, prepareResponse: PrepareMintResponse): string | undefined {
	const a = parseInt(supply)
	if (isNaN(a)) {
		return "supply can not be parsed"
	}
	return undefined
}
