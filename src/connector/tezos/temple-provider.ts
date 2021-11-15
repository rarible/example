import { OpKind, OriginateParams, TezosToolkit, TransferParams } from "@taquito/taquito"
import { TezosProvider } from "tezos-sdk-module/dist/common/base"
import { TempleWallet } from "@temple-wallet/dapp"

export function templeProvider(wallet: TempleWallet, tk: TezosToolkit) : TezosProvider {
	const transfer = async(arg: TransferParams) => {
		const op = await tk.wallet.transfer(arg).send()
		return { hash: op.opHash, confirmation: async() => { await op.confirmation() } }
	}
	const originate = async(arg: OriginateParams) => {
		const op = await tk.wallet.originate(arg).send()
		return {
			hash: op.opHash,
			confirmation: async function() {
				await op.confirmation()
				const op2 = await op.originationOperation()
				this.contract = (op2!.metadata.operation_result.originated_contracts || [])[0]
			},
			contract: undefined as string | undefined
		}
	}
	const batch = async(args: TransferParams[]) => {
		const args2 = args.map(function(a) {
			return {...a, kind: <OpKind.TRANSACTION>OpKind.TRANSACTION} })
		const op = await tk.wallet.batch(args2).send()
		return { hash: op.opHash, confirmation: async() => { await op.confirmation() } }
	}
	const sign = (bytes: string): Promise<string> => {
		return wallet.sign(bytes)
	}
	const address = () => {
		return wallet.getPKH()
	}
	// eslint-disable-next-line camelcase
	const public_key = async() => {
		return tk.signer.publicKey()
	}
	const storage = async(contract: string) => {
		const c = await tk.wallet.at(contract)
		return c.storage()
	}
	return {
		kind: "temple",
		transfer,
		originate,
		batch,
		sign,
		address,
		public_key,
		storage
	}
}
