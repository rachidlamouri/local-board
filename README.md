# Local Board

A really bad white board implementation.

## Install

Clone the repository and run `npm ci`.

## Starting the Server

Serves a white board on `localhost:<PORT>`.
Multiple users can connect at once.
Updates are sent using websockets on port `<WS_PORT>`.

```bash
PORT=**** WS_PORT=**** node .
```
