import React, { useEffect, useState } from "react"
import { Code } from "./code"
import { IBlockchainTransaction } from "@rarible/sdk-transaction/build/domain"
import { Box, Chip, CircularProgress, Typography } from "@mui/material"
import { faCheckDouble, faTimes } from "@fortawesome/free-solid-svg-icons"
import { Icon } from "./icon"



export function TransactionPending({ transaction }: ITransactionInfoProps<any>) {
	const [state, setState] = useState<"resolve" | "reject" | "pending">("pending")
	useEffect( () => {
		transaction.wait()
			.then(() => setState("resolve"))
			.catch(() => setState("reject"))
	}, [])

	return <Box sx={{ my: 1 }}>
		<>
			{ state === "pending" && <><CircularProgress size={14}/> Pending</> }
			{ state === "resolve" && <Chip
				label="completed"
				icon={<Icon icon={faCheckDouble}/>}
				variant="outlined"
				color="success"
				size="small"
			/> }
			{ state === "reject" && <Chip
				label="rejected"
                icon={<Icon icon={faTimes}/>}
                variant="outlined"
                color="error"
				size="small"
			/> }
		</>
	</Box>
}

interface ITransactionInfoProps<T> {
	transaction: IBlockchainTransaction
}

export function TransactionInfo({ transaction }: ITransactionInfoProps<any>) {
	return <>
		<Typography variant="overline">Transaction:</Typography>
		<TransactionPending transaction={transaction}/>
		<Code theme={"light"} language="json" wrap>
			{JSON.stringify(transaction, null, " ")}
		</Code>
	</>
}