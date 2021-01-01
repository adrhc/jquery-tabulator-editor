/**
 * A component rendering a table by using a list of items.
 * Updatable by a state change containing all items.
 */
class SimpleListComponent extends AbstractTableBasedComponent {
    /**
     * @param repository {CrudRepository}
     * @param state {CrudListState}
     * @param view {SimpleListView}
     */
    constructor(repository, state, view) {
        super(state, view);
        this.repository = repository;
        this.state = state;
    }

    /**
     * component initializer: (re)load data, configure events
     *
     * @return {Promise<StateChange>}
     */
    init() {
        return this.reload();
    }

    /**
     * reload data
     *
     * @return {Promise<StateChange>}
     */
    reload() {
        return this._handleRepoErrors(this.repository.getAll())
            .then((items) => {
                console.log("TableEditorComponent items:\n", JSON.stringify(items));
                this.state.updateAll(items);
                return this.updateViewOnStateChange();
            });
    }

    /**
     * called by AbstractComponent.updateViewOnStateChange
     *
     * @param stateChange {StateChange|undefined}
     * @return {Promise<StateChange>}
     */
    updateViewOnUPDATE_ALL(stateChange) {
        return this.view.update(stateChange);
    }
}