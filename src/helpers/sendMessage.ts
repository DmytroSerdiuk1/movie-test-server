export const sendMessage = (message: string): {
    message: string
} => {
    console.log(new Date(), "Message:", message)
    return {
        message
    }
}
