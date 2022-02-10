import React from "react"
import { Box, Grid, GridProps } from "@mui/material"

interface ICommentedBlockProps extends GridProps {
	comment?: React.ReactNode
}

export function CommentedBlock(props: React.PropsWithChildren<ICommentedBlockProps>) {
	const { comment, children, ...rest } = props

	return <Grid container rowSpacing={1} spacing={1} columns={{ xs: 1, lg: 2 }} {...rest}>
		<Grid item xs={1}>
			{children}
		</Grid>
		<Grid item xs={1}>
			{
				comment &&
					<Box sx={{ borderLeft: "5px solid #eee", height: "100%", p: 1 }}>
						{comment}
					</Box>
			}
		</Grid>
	</Grid>
}