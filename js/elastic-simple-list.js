if (Modernizr.template) {
    $.ajaxSetup({
        contentType: 'application/json',
        processData: false
    });
    $.ajaxPrefilter(function (options) {
        if (options.contentType === 'application/json' && options.data) {
            options.data = JSON.stringify(options.data);
        }
    });

    $(() => {
        const items = [{id: 1, name: "dog1"}, {id: 2, name: "dog2"}, {id: 3, name: "dog3"}];

        // dogs table with read-only row (default: on creation prepend to table)
        const component = ElasticListFactory.prototype.create({items, tableId: "dogsTable"});

        component
            .init()
            .then(() => {
                component.doWithState((crudListState) => {
                    crudListState.createNewItem().name = "new dog";
                    crudListState.updateItem({id: 3, name: "updated dog3"});
                    crudListState.removeById(2);
                    crudListState.insertItem({id: 2, name: "restored dog2"});
                });
            });
    });
} else {
    // Find another way to add the rows to the table because
    // the HTML template element is not supported.
}
