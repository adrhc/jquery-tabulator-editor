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
        // DYNAMIC-SELECT-ONE
        DynamicSelectOneFactory.create("dyna-sel-one", DbMock.DYNA_SEL_ONE_PERS_REPOSITORY, {}).init();

        // EDITABLE-LIST
        // dogs table with both read-only and editable row
        const tableIdOrJQuery = "personsTable";
        const tableRelativePositionOnCreate = "prepend";

        // READ-ONLY ROW
        const readOnlyRow = SimpleRowFactory.createIdentifiableRow({
            tableIdOrJQuery,
            tableRelativePositionOnCreate
        });

        // EDITABLE ROW (using child component from CatsEditableListChildFactory)
        const editableRow = SimpleRowFactory.createIdentifiableRow(
            {
                tableIdOrJQuery,
                rowTmplId: "personsTableEditableRowTmpl",
                childCompFactories: [new CatsEditableListChildFactory()]
            });

        // DELETABLE ROW
        // doesn't make sense to use tableRelativePositionOnCreate
        // because the row to delete always have to already exist
        const deletableRow = SimpleRowFactory.createIdentifiableRow(
            {
                tableIdOrJQuery, rowTmplId: "personsTableDeletableRowTmpl"
            });

        // EDITABLE LIST
        const editableList = EditableListFactory.create({
            tableIdOrJQuery,
            repository: DbMock.PERSONS_REPOSITORY,
            readOnlyRow,
            editableRow,
            deletableRow,
            extractedEntityConverterFn: Person.parse
        });

        editableList.init();
    })
} else {
    // Find another way to add the rows to the table because
    // the HTML template element is not supported.
}
