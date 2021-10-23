import React, { useCallback } from "react"

type InputProps = {
	value: string
	onChange: (value: string) => void
	placeholder?: string
}

export function Input({ value, onChange, placeholder }: InputProps) {
	const onChangeCallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		onChange(e.target.value)
	}, [onChange])

	return (
		<input
			type="text"
			value={value}
			onChange={onChangeCallback}
			style={{ width: 500 }}
			placeholder={placeholder}
		/>
	)
}
