import React from "react"
import { Box, Typography } from "@mui/material"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { BuyPrepareForm } from "./buy-prepare-form"
import { BuyForm } from "./buy-form"
import { BuyComment } from "./comments/buy-comment"
import { Code } from "../../components/common/code"
import { TransactionInfo } from "../../components/common/transaction-info"

export function BuyPage() {
	return (
		<Page header="Buy Token">
			<CommentedBlock sx={{ my: 2 }} comment={<BuyComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Item Info",
							render: (onComplete) => {
								return <BuyPrepareForm onComplete={onComplete}/>
							}
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <BuyForm onComplete={onComplete} prepare={lastResponse}/>
							}
						},
						{
							label: "Done",
							render: (onComplete, lastResponse) => {
								return <RequestResult
									result={{ type: "complete", data: lastResponse }}
									completeRender={(data) =>
										<Box sx={{ my: 2 }}>
											<TransactionInfo transaction={data}/>
										</Box>
									}
								/>
							}
						}
					]}
				/>
			</CommentedBlock>
		</Page>
	)
}
