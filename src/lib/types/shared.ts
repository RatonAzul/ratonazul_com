export enum ButtonStatus {
    default = 'default',
    error = 'error',
    warning = 'warning',
    success = 'success',
    disabled = 'disabled',
}

export function getButtonStyles(status: ButtonStatus) {
    switch (status) {
        case ButtonStatus.default:
            return "bg-blue hover:bg-blue-dark text-bg0 hover:cursor-pointer"
        case ButtonStatus.error:
            return "bg-red hover:bg-red-dark text-bg0 hover:cursor-pointer"
        case ButtonStatus.warning:
            return "bg-yellow hover:bg-yellow-dark text-bg0 hover:cursor-pointer"
        case ButtonStatus.disabled:
            return "bg-gray-dark text-bg0"
        case ButtonStatus.success:
            return "bg-green hover:bg-green-dark text-bg0 hover:cursor-pointer"
    }
}