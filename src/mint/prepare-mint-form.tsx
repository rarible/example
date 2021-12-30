import { useState } from "react"
import { ContractAddress, toContractAddress } from "@rarible/types"
import { Input } from "../common/input"
import { FormProps } from "../common/form-props"

//todo add to sdk
export type FixedPrepareMintRequest = { collectionId: ContractAddress }

export function PrepareMintForm({ onSubmit }: FormProps<FixedPrepareMintRequest>) {
	const [collectionId, setCollectionId] = useState("ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82")
	return (
		<div>
			<div>
				<Input
					value={collectionId}
					onChange={setCollectionId}
					placeholder="Collection Id (ex: ETHEREUM:0xc34c39aa3a83afdd35cb65351710cfc56a85c9f4)"
				/>
			</div>
			<button onClick={() => onSubmit({ collectionId: toContractAddress(collectionId) })}>Submit</button>
			<p>
				Enter Collection Id in the input and press Submit to start minting
			</p>
		</div>
	)
}
