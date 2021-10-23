import React, { useState } from "react"
import { Maybe } from "./maybe"
import { Loader } from "./loader"

type FormWithResultProps<Form, Response> = {
	renderForm: (onSubmit: (form: Form) => void) => JSX.Element
	children: (response: Response) => JSX.Element
	process: (form: Form) => Promise<Response>
}

/**
 * Renders form, after submit sends the form, awaits for the result and displays it
 */
export function FormWithResult<Form, Response>(
	{ renderForm, process, children }: FormWithResultProps<Form, Response>,
) {
	const [form, setForm] = useState<Maybe<Form>>()
	if (form === undefined) {
		return renderForm(setForm)
	}
	return (
		<Loader request={form} load={process} children={children}/>
	)
}
