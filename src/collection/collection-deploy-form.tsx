import { useState } from "react"
import { Input } from "../common/input"
import { FormProps } from "../common/form-props"
import { DeploySupportedBlockchains, DeployTokenRequest } from "@rarible/sdk/build/types/nft/deploy/domain";
import {Blockchain} from "@rarible/api-client";

type CollectionDeployFormProps = FormProps<DeployTokenRequest>;

export function CollectionDeployForm({ onSubmit }: CollectionDeployFormProps) {
	const [blockchain, setBlockchain] = useState(Blockchain.ETHEREUM)
	const [name, setName] = useState("example collection")
	const [symbol, setSymbol] = useState("EXMPL")
	const [baseURI, setBaseURI] = useState("http://example.com")
	const [contractURI, setContractURI] = useState("http://example.com")

	const getRequest: () => DeployTokenRequest = () => {
		switch (blockchain) {
			case Blockchain.ETHEREUM:
				return {
					blockchain: Blockchain.ETHEREUM as DeploySupportedBlockchains,
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
				}
			case Blockchain.TEZOS:
				return {
					blockchain: Blockchain.TEZOS as DeploySupportedBlockchains,
					asset: {
						assetType: "NFT",
						arguments: {
							name: name,
							symbol: symbol,
							contractURI: contractURI,
							isUserToken: false,
						},
					},
				}
			default:
				throw new Error("Unsupported blockchain")
		}
	}

	return (
		<div>
			<div>
				<label htmlFor="blockchain">Blockchain</label>
				<select id="blockchain" value={blockchain} onChange={(e) => setBlockchain(e.target.value as Blockchain)} >
					<option value={Blockchain.ETHEREUM}>{Blockchain.ETHEREUM}</option>
					<option value={Blockchain.TEZOS}>{Blockchain.TEZOS}</option>
				</select>
			</div>
			<div>
				<Input value={name} onChange={setName} placeholder="Name"/>
			</div>
			<div>
				<Input value={symbol} onChange={setSymbol} placeholder="Symbol"/>
			</div>
			{
				blockchain === Blockchain.ETHEREUM ?
					<div>
						<Input value={baseURI} onChange={setBaseURI} placeholder="Base URI"/>
					</div>
				: null
			}
			<div>
				<Input value={contractURI} onChange={setContractURI} placeholder="Contract URI"/>
			</div>

			<button onClick={() => onSubmit(getRequest())}>
				Submit
			</button>
		</div>
	)
}
