const Endpoint = require(blitz.config[blitz.id].endpointParent)

class Index extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.view = "templates/company.vue"
  }
}

module.exports = Index