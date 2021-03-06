const Endpoint = cubic.nodes.ui.core.Endpoint

/**
 * Contains multi-purpose functions for child-methods and provides default values
 */
class Index extends Endpoint {
  constructor (api, db, url) {
    super(api, db, url)
    this.schema.url = '/warframe/items/:item'
    this.schema.view = '/sites/warframe/items/price.vue'
  }
}

module.exports = Index
