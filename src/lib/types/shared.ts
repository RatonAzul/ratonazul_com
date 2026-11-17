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
            return "button-accent"
        case ButtonStatus.error:
            return "button-danger"
        case ButtonStatus.warning:
            return "button-warning"
        case ButtonStatus.disabled:
            return "button-secondary"
        case ButtonStatus.success:
            return "button-primary"
    }
}
