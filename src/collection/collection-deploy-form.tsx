import { useState } from "react"
import { Input } from "../common/input"
import { FormProps } from "../common/form-props"
import {DeployTokenRequest} from "@rarible/sdk/build/types/nft/deploy/domain";
import {Blockchain} from "@rarible/api-client";

type CollectionDeployFormProps = FormProps<DeployTokenRequest>;

export function CollectionDeployForm({ onSubmit }: CollectionDeployFormProps) {
	const [name, setName] = useState("example collection")
	const [symbol, setSymbol] = useState("EXMPL")
	const [baseURI, setBaseURI] = useState("http://example.com")
	const [contractURI, setContractURI] = useState("http://example.com")

	return (
		<div>
			<div>
				<Input value={name} onChange={setName} placeholder="Name"/>
			</div>
			<div>
				<Input value={symbol} onChange={setSymbol} placeholder="Symbol"/>
			</div>
			<div>
				<Input value={baseURI} onChange={setBaseURI} placeholder="Base URI"/>
			</div>
			<div>
				<Input value={contractURI} onChange={setContractURI} placeholder="Contract URI"/>
			</div>

			<button
				onClick={() => onSubmit({
					blockchain: Blockchain.ETHEREUM,
					asset: {
						assetType: "ERC721",
						arguments: {
							name: name,
							symbol: symbol,
							baseURI: baseURI,
							contractURI: contractURI,
							isUserToken: false
						}
					}
				})}
			>
				Submit
			</button>
		</div>
	)
}