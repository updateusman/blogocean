class ApiResponse {
  constructor(statusCode, message = "seuccess", data) {
    // super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = true < 400;
  }
}

export { ApiResponse };
