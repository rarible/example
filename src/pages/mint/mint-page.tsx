import React from "react"
import { Box, Typography } from "@mui/material"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { InlineCode } from "../../components/common/inline-code"
import { CopyToClipboard } from "../../components/common/copy-to-clipboard"
import { Code } from "../../components/common/code"
import { MintPrepareForm } from "./mint-prepare-form"
import { MintForm } from "./mint-form"
import { MintComment } from "./comments/mint-comment"
import { TransactionInfo } from "../../components/common/transaction-info"

export function MintPage() {
	return (
		<Page header="Mint Token">
			<CommentedBlock sx={{ my: 2 }} comment={<MintComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Collection & Prepare Mint",
							render: (onComplete) => {
								return <MintPrepareForm onComplete={onComplete}/>
							}
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <MintForm onComplete={onComplete} prepare={lastResponse}/>
							}
						},
						{
							label: "Done",
							render: (onComplete, lastResponse) => {
								return <RequestResult
									result={{ type: "complete", data: lastResponse }}
									completeRender={(data) =>
										<>
											<Box sx={{ my: 2 }}>
												<Typography variant="overline">Type:</Typography>
												<div>
													<InlineCode wrap>{data.type}</InlineCode>
												</div>
											</Box>
											<Box sx={{ my: 2 }}>
												<Typography variant="overline">Item ID:</Typography>
												<div>
													<InlineCode wrap>{data.itemId}</InlineCode> <CopyToClipboard value={data.itemId}/>
												</div>
											</Box>
											{
												data.type === "on-chain" &&
													<Box sx={{ my: 2 }}>
														<TransactionInfo transaction={data.transaction}/>
													</Box>
											}
										</>
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
