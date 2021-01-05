/**
 * A SimpleListComponent able to accept item-level state changes then updating the view at row level.
 * Uses a SimpleRowComponent to render the updated items (aka rows).
 */
class ElasticListComponent extends SimpleListComponent {
    /**
     * @param repository {CrudRepository}
     * @param state {CrudListState}
     * @param view {SimpleListView}
     * @param simpleRow {SimpleRowComponent}
     */
    constructor(repository, state, view, simpleRow) {
        super(repository, state, view);
        this.simpleRow = simpleRow;
        this.stateChangesDispatcher.knownRequestTypes.splice(0, 0, "CREATE", "UPDATE", "DELETE");
    }

    /**
     * Offer the state for manipulation then update the view.
     *
     * @param stateUpdaterFn {function} receives a state {CrudListState} to update
     * @param delayViewUpdate {boolean|undefined} whether to (immediately) update the view based or not
     * @return {Promise<StateChange[]>}
     */
    doWithState(stateUpdaterFn, delayViewUpdate = false) {
        console.log("ElasticListComponent.doWithState: delayViewUpdate=", delayViewUpdate);
        stateUpdaterFn(this.state);
        if (delayViewUpdate) {
            return Promise.resolve(this.state.peekAll());
        }
        return this.updateViewOnStateChanges();
    }

    /**
     * @param stateChange {PositionStateChange}
     * @return {Promise<PositionStateChange>}
     * @private
     */
    updateViewOnKnownStateChange(stateChange) {
        console.log("ElasticListComponent.updateViewOnStateChange\n", JSON.stringify(stateChange));
        return this.simpleRow.update(stateChange.data, stateChange.requestType, stateChange.afterItemId);
    }
}