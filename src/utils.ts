export const generateIdFromTwoFields = (fieldOne: string, fieldTwo: string): string => {
    return fieldOne + '-' + fieldTwo;
}

export const generateUniqueId = (transactionHash: string, logIndex: string): string => {
    return transactionHash + '-' + logIndex;
}