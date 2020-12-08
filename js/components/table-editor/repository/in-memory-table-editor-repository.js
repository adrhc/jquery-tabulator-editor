class InMemoryTableEditorRepository extends TableEditorRepository {
    items = {};

    getAll() {
        return this._promiseOf(Object.values(this.items));
    }

    insert(item) {
        item.id = Math.random();
        return this.update(item);
    }

    update(item) {
        this.items[item.id] = this._itemOf(item);
        return this._promiseOf(item);
    }

    /**
     * @param itemOrItems {IdentifiableEntity|IdentifiableEntity[]}
     * @return {Promise<IdentifiableEntity|IdentifiableEntity[]>}
     * @private
     */
    _promiseOf(itemOrItems) {
        if ($.isArray(itemOrItems)) {
            return Promise.resolve($.extend(true, [], itemOrItems));
        } else {
            return Promise.resolve($.extend(true, this._itemOf(), itemOrItems));
        }
    }

    /**
     * @param data
     * @return {IdentifiableEntity}
     * @private
     */
    _itemOf(data) {
        if (data) {
            return $.extend(true, this.newItem(), data);
        } else {
            return this.newItem();
        }
    }

    newItem() {
        return new IdentifiableEntity();
    }
}