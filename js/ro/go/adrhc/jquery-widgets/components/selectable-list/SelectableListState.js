/**
 * SelectableListState extends CrudListState extends SimpleListState extends TaggingStateHolder
 */
class SelectableListState extends CrudListState {
    /**
     * @type {RowSwappingStateHolder}
     */
    swappingState;

    /**
     * @param {IdentifiableEntity[]} [initialState]
     * @param {function(): IdentifiableEntity} [newEntityFactoryFn]
     * @param {boolean} [newItemsGoToTheEndOfTheList]
     * @param {RowSwappingStateHolder} [swappingState]
     */
    constructor({
                    initialState,
                    newEntityFactoryFn,
                    newItemsGoToTheEndOfTheList,
                    swappingState = new RowSwappingStateHolder()
                }) {
        super({initialState, newEntityFactoryFn, newItemsGoToTheEndOfTheList});
        this.swappingState = swappingState;
    }

    /**
     * @param {numeric|string} id
     * @param {string} context is some context data
     * @return {boolean} whether the switch actually happened or not
     */
    switchTo(id, context) {
        if (id == null) {
            console.log(`${this.constructor.name}, context = ${context}, id is null! switching off`)
            return this.switchToOff();
        }
        const item = this.findById(id);
        if (!item) {
            console.log(`${this.constructor.name}, context = ${context}, no item found for id = ${id}! switching off`)
            return this.switchToOff();
        }
        const previousEntityRowSwap = this.swappingState.currentState;
        const newEntityRowSwap = new EntityRowSwap(context, item, this.indexOf(item));
        const switched = !!this.swappingState.switchTo(newEntityRowSwap);
        if (switched) {
            AssertionUtils.isNotNull(newEntityRowSwap);
            if (previousEntityRowSwap != null) {
                this._processSwitchedOff(previousEntityRowSwap);
            }
            this._processSwitchedOn(newEntityRowSwap);
        }
        return switched;
    }

    /**
     * @return {boolean} whether the switch off actually happened or not
     */
    switchToOff() {
        const previousEntityRowSwap = this.swappingState.currentState;
        const switched = !!this.swappingState.switchOff();
        if (switched) {
            AssertionUtils.isNotNull(previousEntityRowSwap);
            this._processSwitchedOff(previousEntityRowSwap);
        }
        return switched;
    }

    /**
     * @param {EntityRowSwap} newEntityRowSwap
     * @protected
     */
    _processSwitchedOn(newEntityRowSwap) {
        return this._collectSwitch(newEntityRowSwap, SwitchType.ON);
    }

    /**
     * @param {EntityRowSwap} previousEntityRowSwap
     * @protected
     */
    _processSwitchedOff(previousEntityRowSwap) {
        if (this._isTransient(previousEntityRowSwap)) {
            return this.removeTransient();
        } else {
            return this._collectSwitch(previousEntityRowSwap, SwitchType.OFF);
        }
    }

    /**
     * @param {EntityRowSwap} entityRowSwap
     * @return {boolean}
     * @protected
     */
    _isTransient(entityRowSwap) {
        return entityRowSwap != null && EntityUtils.isTransientId(entityRowSwap.entityId);
    }

    /**
     * @param {EntityRowSwap} entityRowSwap
     * @param {"ON"|"OFF"} switchType
     * @return {TaggedStateChange<EntityRowSwap>}
     * @private
     */
    _collectSwitch(entityRowSwap, switchType) {
        const entity = this.findById(entityRowSwap.entityId);
        if (entity == null) {
            // removed entity meanwhile
            return undefined;
        }
        // entity might change after an editable or transient one is saved
        entityRowSwap.entity = entity;
        // index might change after removing a transient
        entityRowSwap.index = this.indexOf(entityRowSwap.entity);
        return this.stateChanges.collect(new TaggedStateChange(switchType,
            undefined, entityRowSwap, entityRowSwap.index));
    }

    /**
     * @param {string|number} id
     * @return {IdentifiableEntity}
     */
    findById(id) {
        return EntityUtils.findById(id, this.items);
    }

    indexOf(item) {
        return this.items.indexOf(item);
    }

    reset() {
        super.reset();
        this.swappingState.reset();
    }
}

class SwitchType {
    static ON = "ON";
    static OFF = "OFF";
}