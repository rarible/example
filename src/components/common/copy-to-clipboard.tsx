import React, { useCallback, useState } from "react"
import copy from 'copy-to-clipboard'
import { IconButton, Tooltip } from "@mui/material"
import { Icon } from "./icon"
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons"

interface ICopyToClipboardProps {
	value: string
}

export function CopyToClipboard({ value }: ICopyToClipboardProps) {
	const [copied, setCopied] = useState(false)
	const copyHandler = useCallback(() => {
		copy(value, {onCopy: () => setCopied(true)})
	}, [value])

	return <Tooltip title="Copy To Clipboard" placement="top">
		<IconButton
			color={copied ? "success" : "default"}
			onClick={copyHandler}
		>
			<Icon icon={copied ? faCheck : faCopy}/>
		</IconButton>
	</Tooltip>
}