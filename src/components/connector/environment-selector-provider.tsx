import React, { useState } from "react"
import { Connector } from "@rarible/connector"
import { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { IWalletAndAddress } from "./wallet-connetion"
import { getConnector } from "./connectors-setup"

export interface IEnvironmentContext {
	environment: RaribleSdkEnvironment
	setEnvironment?: ((env: RaribleSdkEnvironment) => void),
}

export const EnvironmentContext = React.createContext<IEnvironmentContext>({
	environment: "staging",
	setEnvironment: undefined
})

export interface IConnectorComponentProps {
	children: (connector: Connector<string, IWalletAndAddress>) => React.ReactNode
}

export function EnvironmentSelectorProvider({ children }: React.PropsWithChildren<IConnectorComponentProps>) {
	const [environment, setEnvironment] = useState<RaribleSdkEnvironment>("staging")
	const connector = getConnector(environment)

	const context: IEnvironmentContext = {
		environment,
		setEnvironment
	}

	return <EnvironmentContext.Provider value={context}>
		{children(connector)}
	</EnvironmentContext.Provider>
}