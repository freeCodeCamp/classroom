// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/**
 * The function "handler" sends a JSON response with the name "John Doe" and a status code of 200.
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server. It contains
 * information such as the request method, headers, URL, and any data sent with the request.
 * @param res - The `res` parameter is the response object that is used to send a response back to the client. It has
 * various methods and properties that can be used to manipulate the response, such as setting the status code, sending
 * JSON data, setting headers, etc. In the given code, the `status
 */
export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' });
}
