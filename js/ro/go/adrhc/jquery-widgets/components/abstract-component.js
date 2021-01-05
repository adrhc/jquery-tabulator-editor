class AbstractComponent {
    /**
     * @param state {BasicState}
     * @param view {AbstractView}
     * @param knownRequestTypes {string[]}
     */
    constructor(state, view, knownRequestTypes = []) {
        this.state = state;
        this.view = view;
        this.knownRequestTypes = knownRequestTypes;
    }

    /**
     * @return {Promise<StateChange[]|undefined>}
     */
    init() {
        return Promise.resolve(undefined);
    }

    close() {
        if (this.view.$elem) {
            this.view.$elem.off(this._eventsNamespace);
        }
        this.state.reset();
        this.view.reset();
    }

    /**
     * by default this component won't use the owner to detect its fields
     *
     * @param useOwnerOnFields {boolean}
     * @return {*}
     */
    extractEntity(useOwnerOnFields) {
        const inputValues = this.extractInputValues(useOwnerOnFields);
        return EntityUtils.prototype.removeTransientId(inputValues);
    }

    /**
     * @param useOwnerOnFields {boolean}
     * @return {*}
     */
    extractInputValues(useOwnerOnFields = false) {
        return this.view.extractInputValues(useOwnerOnFields);
    }

    /**
     * Process (orderly) multiple state changes to update the view.
     *
     * @param stateChanges {StateChange[]|undefined}
     * @param applyChangesStartingFromLatest {boolean|undefined}
     * @return {Promise<StateChange[]>}
     */
    updateViewOnStateChanges(stateChanges, applyChangesStartingFromLatest) {
        stateChanges = stateChanges ? stateChanges : this.state.consumeAll(applyChangesStartingFromLatest);
        if (!stateChanges || !stateChanges.length) {
            // can happen when switching to undefined multiple times (e.g. dblclick on header)
            // or clicking in an input box on an editable row
            console.warn("no state changes!");
            return Promise.resolve(stateChanges);
        }
        const promiseHolder = {};
        stateChanges.forEach(stateChange => {
            if (promiseHolder.promise) {
                promiseHolder.promise = promiseHolder.promise.then(() => this.updateViewOnStateChange(stateChange));
            } else {
                promiseHolder.promise = this.updateViewOnStateChange(stateChange);
            }
        });
        return promiseHolder.promise.then(() => stateChanges);
    }

    /**
     * @param stateChange {StateChange|undefined}
     * @return {Promise<StateChange>}
     */
    updateViewOnStateChange(stateChange) {
        stateChange = stateChange ? stateChange : this.state.consumeOne();
        if (!stateChange) {
            console.warn("no state change!");
            return Promise.resolve(stateChange);
        }
        const fnName = `updateViewOn${stateChange.requestType}`;
        if (typeof this[fnName] === "function") {
            return this[fnName](stateChange);
        } else if (this.knownRequestTypes.includes(stateChange.requestType)) {
            return this._updateViewOnKnownStateChange(stateChange);
        } else {
            return this.updateViewOnAny(stateChange);
        }
    }

    /**
     * @param stateChange {StateChange|undefined}
     * @return {Promise<StateChange>}
     * @protected
     */
    _updateViewOnKnownStateChange(stateChange) {
        console.debug(`${this.constructor.name}._updateViewOnKnownStateChange:\n${JSON.stringify(stateChange)}`);
        return this.view.update(stateChange);
    }

    updateViewOnAny(stateChange) {
        console.debug(`${this.constructor.name}.updateViewOnAny:\n${JSON.stringify(stateChange)}`);
        return this.view.update(stateChange);
    }

    /**
     * @param events {string,string[]}
     * @return {string|*}
     * @protected
     */
    _appendNamespaceTo(events) {
        if ($.isArray(events)) {
            return events.map(ev => this._appendNamespaceTo(ev)).join(" ");
        } else {
            return `${events}${this._eventsNamespace}`;
        }
    }

    /**
     * (internal) errors handler
     *
     * @param promise
     * @return {Promise<any>}
     * @protected
     */
    _handleRepoErrors(promise) {
        return promise.catch((jqXHR, textStatus, errorThrown) => {
            if (typeof jqXHR === "string" || typeof jqXHR === "number") {
                alert(jqXHR);
                throw jqXHR;
            } else {
                console.log(`errorThrown: ${errorThrown}`);
                alert(`${textStatus}\n${jqXHR.responseText}`);
                throw textStatus;
            }
        });
    }

    /**
     * @returns {string}
     * @protected
     */
    get _eventsNamespace() {
        return `.${this.constructor.name}.${this.owner}`;
    }

    get owner() {
        return this.view.owner;
    }
}