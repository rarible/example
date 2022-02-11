import React from "react"
import { useForm } from "react-hook-form"
import { faCheckDouble, faExclamationTriangle, faCheck } from "@fortawesome/free-solid-svg-icons"
import { LoadingButton } from "@mui/lab"
import { size } from "lodash"
import { Icon } from "../icon"

interface IFormSubmitProps {
	form: ReturnType<typeof useForm>
	label: string
	state: "error" | "success" | "normal"
}

export function FormSubmit({ form, label, state }: IFormSubmitProps) {
	const { formState: { errors, isSubmitting, isValidating } } = form

	const isValid = size(errors) === 0

	let color = undefined
	let icon = undefined
	if (!isValid) {
		color = "warning"
		icon = <Icon icon={faExclamationTriangle}/>
	} else {
		switch (state) {
			case "error":
				color = "error"
				icon = <Icon icon={faExclamationTriangle}/>
				break
			case "success":
				color = "success"
				icon = <Icon icon={faCheckDouble}/>
				break
			case "normal":
			default:
				color = "primary"
				icon = <Icon icon={faCheck}/>
				break
		}
	}

	return <LoadingButton
		type="submit"
		loading={isSubmitting || isValidating}
		loadingPosition="start"
		startIcon={icon}
		color={color as any}
		variant="contained"
	>
		{label}
	</LoadingButton>
}