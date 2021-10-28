import React, { useCallback } from "react"

type CheckboxProps = {
	value: boolean
	onChange: (value: boolean) => void
	label: string
}

export function Checkbox({ value, onChange, label }: CheckboxProps) {
	const onChangeCallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		onChange(e.target.checked)
	}, [onChange])

	return (
		<div>
			<input
				type="checkbox"
				checked={value}
				onChange={onChangeCallback}
			/>
			{label}
		</div>
	)
}
