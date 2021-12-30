import {PrepareFillResponse} from "@rarible/sdk/build/types/order/fill/domain";


export function validate(amount: string, prepareResponse: PrepareFillResponse): string | undefined {
    const a = parseInt(amount)
    if (isNaN(a)) {
        return "amount can not be parsed"
    }
    //todo should this be number?
    if (prepareResponse.maxAmount == undefined) {
        return undefined
    }
    if (a > parseInt(prepareResponse.maxAmount)) {
        return `max amount: ${prepareResponse.maxAmount}`
    }
    return undefined
}
