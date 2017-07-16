'use strict'

const Endpoint = require(blitz.config.core.endpointParent)

/**
 * Endpoint to receive ping responses from bots, including their status
 */
class Pong extends Endpoint {

    constructor(api, db, url) {
        super(api, db, url)

        // Modify schema
        this.schema.method = "POST"
        this.schema.scope = "root-read-write"
    }

    /**
     * Main method which is called by MethoHandler on request
     */
    main(status) {
        return new Promise((resolve, reject) => {
            this.publish(this.url, status)
            resolve("pong")
        })
    }
}

module.exports = Pong