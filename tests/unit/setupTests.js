// shim for console errors/warnings
global.console.error = (error, ...args) => {
  let errorMessage = typeof error === 'string' ? error : error.message
  args.forEach(argument => {
    errorMessage = errorMessage.replace(/%(s|d|i|o|O)/, argument)
  })
  throw new Error(errorMessage)
}
