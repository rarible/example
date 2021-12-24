export type AbstractAddress<
  T,
  Origin extends AbstractOriginAddress,
  Raw extends AbstractRawAddress,
> = {
  blockchain: T
  origin: Origin
  raw: Raw
  displayable: string
}

export type AnyAddress = AbstractAddress<any, any, any>

export type AbstractOriginAddress = string & {
  __IS_ORIGIN_ADDRESS__: true
}

export type AbstractRawAddress = string & {
  __IS_RAW_ADDRESS__: true
}
