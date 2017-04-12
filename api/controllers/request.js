'use strict'

const Cache = require('./cache.js')
const mongodb = require('mongodb').MongoClient
const _ = require('lodash')


/**
 * Checks request against endpoints given by dbs node
 */
class Request {

    /**
     * Connect to databases
     */
    constructor() {

        // Initialize endpoint config
        this.schema = {
            uat: new Date()
        }

        // Array for connected database state
        this.dbstack = []
        this.ready = false
        this.dbclients = 2

        // Load up cache controller
        this.cache = new Cache()
        this.cache.client.on('ready', () => this.confirmDB("redis"))

        // Connect to mongo
        this.db = mongodb
        this.db.connect(process.env.mongo_url, (err, db) => {
            if (!err) {
                this.db.config = db.collection("config")
                this.confirmDB("mongodb")
            }
        })
    }


    /**
     * Adds db client name to dbstack, if all clients connected -> this.ready
     */
    confirmDB(db) {
        this.dbstack.push(db)
        if (this.dbstack.length === this.dbclients) this.ready = true
    }


    /**
     * Controls Request processing
     */
    getResponse(req) {
        return new Promise((resolve, reject) => {

            // Assign values to request
            let route = req.url.split('/')
            route.pop()
            route = (route.join('/') + '/' + req.body.method).replace("%20", " ")

            let request = {
                user: req.user,
                verb: req.method,
                route: route,
                method: req.body.method,
                params: req.body.params,
            }

            // Verify & Parse request
            let options = this.parse(request)

            // Unauthorized
            if (options === "unauthorized") {
                resolve({
                    statusCode: 401,
                    body: "Unauthorized"
                })
            }

            // Params returned
            else if (options) {
                this.send(options).then(data => {
                    resolve({ statusCode: 200, body: data})
                })
            }

            // No params returned
            else {
                resolve({
                    statusCode: 405,
                    body: 'Invalid Request. Refer to api.nexus-stats.com for documentation.'
                })
            }
        })
    }


    /**
     * Sends request to connected sockets. First response is accepted
     * Note: figure out way to cancel operations after one node already finished
     * E.g.: Listen to options.callback with data 'cancel' -> stop current progress
     */
    send(options) {
        return new Promise((resolve, reject) => {

            // Generate unique callback for emit & pass to responding node
            options.callback = process.hrtime().join('').toString()

            // Send Request to all Core Nodes
            this.client.root.emit('req', options)

            // Listen to all sockets for response
            Object.keys(this.client.root.sockets).forEach(id => {
                let socket = this.client.root.sockets[id]

                socket.on(options.callback, data => {
                    socket.removeAllListeners(options.callback)
                    resolve(data)
                })
            })
        })
    }


    /**
     * Verify Request Validity with cached data from core-node
     */
    parse(req) {

        // Check if Schema requires updating
        this.compareSchema()

        // Check if method in schema
        for (var sub in this.schema.endpoints) {
            let endpoint = this.schema.endpoints[sub]
            let reqroute = req.route.split('/')
            let scmroute = endpoint.route.split('/')
            let matching = false
            let params = []

            // Match route with endpoint
            for (var i = 0; i < scmroute.length; i++) {

                // Get route resource params
                if (scmroute[i][0] === ':') {
                    matching = true
                    params.push(reqroute[i])
                }

                // Mismatch
                else if (scmroute[i] !== reqroute[i]) {
                    matching = false
                    break
                }

                else matching = true
            }

            // Route matches
            if (matching) {
                if (!endpoint.scope.includes(req.user.scp)) return "unauthorized"
                if (req.verb !== endpoint.verb) return false

                // Compare param types
                for (var i = 0; i < endpoint.params.length; i++) {
                    let specs = endpoint.params[i]

                    // Param included in request?
                    let requested = false
                    Object.keys(req.params).map((key, index) => {
                        if (key === specs.name) requested = req.params[key]
                    })

                    // Requested not falsy -> request value in `requested`
                    if (requested) {
                        if (specs.type === 'number') {
                            if (isNaN(requested)) return false
                            else requested = parseFloat(requested)
                        }
                        params.push(requested)
                    }

                    // Not requested -> assign default value
                    else {
                        if (typeof specs.default === 'function') params.push(specs.default())
                        else params.push(specs.default)
                    }
                }

                let options = {
                    file: endpoint.file,
                    params: params
                }

                return options
            }
        }

        // No endpoint matched
        return false
    }

    /**
     * Saves endpoints from core node to db
     */
    saveEndpoints(endpoints) {
        let config = {
            type: 'endpoints',
            data: endpoints,
        }
        this.db.config.updateOne(
            {type: 'endpoints'},
            {$set: config},
            {upsert: true}
        )

        // Save in memory store
        this.convertSchema(config.data)
        this.schema.endpoints = config.data
        this.schema.uat = new Date()
    }


    /**
     * Refresh endpoint config every 30 minutes
     */
    compareSchema() {
        let now = new Date()
        if (now - this.schema.uat > 1800000) {
            this.db.config.findOne({
                type: "endpoints"
            }, (err, config) => {
                this.convertSchema(config.data)
                this.schema.endpoints = config.data
                this.schema.uat = now
            })
        }
    }


    /**
     * Converts Schema to local standards & converts string functions to real functions
     */
    convertSchema(endpoints) {
        for (var endpoint in endpoints) {

            // Param modifications
            if (Object.keys(endpoints[endpoint].params).length > 0) {
                endpoints[endpoint].params.forEach((specs, i) => {

                    // If string -> check if function (workaround for json.stringify on socket.emit)
                    if (typeof specs.default === 'string' && (specs.default.includes("() => {") || specs.default.includes("function ("))) {

                        // Function from String (remove everything before first { and last }), override default
                        let fn = new Function(specs.default.substring(specs.default.indexOf("{") + 1).slice(0, -1))
                        endpoints[endpoint].params[i].default = fn
                    }
                })
            }

            // Minimum scope to full array
            if (typeof endpoints[endpoint].scope === 'string') {
                let scope = require('../config/scopes.js')
                for (var i = 0; i < scope.length; i++) {
                    if (scope[i] === endpoints[endpoint].scope) scope = scope.slice(i, scope.length)
                }
                endpoints[endpoint].scope = scope
            }
        }
    }
}

module.exports = new Request()