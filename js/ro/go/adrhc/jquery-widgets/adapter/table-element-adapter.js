/**
 * Role: adapter to HTMLTableElement
 */
class TableElementAdapter {
    /**
     * @type {jQuery<HTMLTableElement>}
     * @private
     */
    _$table;
    /**
     * @type {string}
     * @private
     */
    _tableId;
    /**
     * @type {string}
     * @private
     */
    _owner;

    /**
     * @param tableId {string|jQuery<HTMLTableRowElement>}
     */
    constructor(tableId) {
        this._setupElem(tableId);
        this._setupTableId();
        this._setupOwner();
    }

    /**
     * @param tableId {string|jQuery<HTMLTableRowElement>}
     * @protected
     */
    _setupElem(tableId) {
        if (tableId instanceof jQuery) {
            this._$table = tableId;
        } else {
            this._$table = $(`#${tableId}`);
        }
    }

    _setupTableId() {
        const dataId = this.$table.data("id");
        this._tableId = dataId ? dataId : this.$table.attr("id");
    }

    /**
     * @protected
     */
    _setupOwner() {
        const dataOwner = this.$table.data("owner");
        if (dataOwner) {
            this._owner = dataOwner;
        } else {
            this._owner = this._tableId;
        }
    }

    /**
     * @param rowDataId {number|string}
     * @param rowHtml {string}
     * @param replaceExisting {boolean|undefined}
     * @param neighbourRowDataId {number|string}
     * @param neighbourRelativePosition {"before"|"after"}
     * @param tableRelativePosition {"prepend"|"append"}
     * @param createIfNotExists {boolean|undefined}
     */
    renderRow({
                  rowDataId,
                  rowHtml,
                  replaceExisting = true,
                  neighbourRowDataId,
                  neighbourRelativePosition = "before",
                  tableRelativePosition = "prepend",
                  createIfNotExists
              }) {
        rowHtml = rowHtml ? rowHtml : this.emptyRowHtmlOf(rowDataId);
        const $existingRow = rowDataId ? this.$getRowByDataId(rowDataId) : {};
        if ($existingRow.length) {
            if (replaceExisting) {
                // replace existing
                $existingRow.replaceWith(rowHtml);
            }
        } else if (createIfNotExists) {
            if (neighbourRowDataId) {
                const $neighbour = this.$getRowByDataId(neighbourRowDataId);
                $neighbour[neighbourRelativePosition]($(rowHtml));
            } else if (tableRelativePosition) {
                this.$tbody[tableRelativePosition]($(rowHtml));
            }
        }
    }

    /**
     * @param elem {HTMLElement|jQuery<HTMLElement>}
     * @param [searchParentsForDataIdIfMissingOnElem] {boolean}
     * @return {string|number}
     */
    rowDataIdOf(elem, searchParentsForDataIdIfMissingOnElem) {
        const $elem = elem instanceof jQuery ? elem : $(elem);
        if ($elem.is(this.ownerSelector)) {
            const dataId = $elem.data("id");
            if (dataId) {
                return $elem.data("id");
            } else if (searchParentsForDataIdIfMissingOnElem) {
                return this.rowDataIdOfParent($elem);
            }
        } else {
            return this.rowDataIdOfParent($elem);
        }
    }

    /**
     * @param elem {HTMLElement|jQuery}
     * @return {string|number}
     */
    rowDataIdOfParent(elem) {
        const $elem = elem instanceof jQuery ? elem : $(elem);
        return $elem.parents(`tr${this.ownerSelector}`).data("id");
    }

    emptyRowHtmlOf(rowDataId) {
        return `<tr data-owner='${this.owner}' data-id='${rowDataId}'></tr>`;
    }

    deleteRowByDataId(rowDataId) {
        this.$getRowByDataId(rowDataId).remove();
    }

    /**
     * @return {jQuery<HTMLTableRowElement>[]}
     */
    $getAllRows() {
        return this.$tbody.children(`tr${this.ownerSelector}`);
    }

    /**
     * @param rowDataId
     * @return {jQuery<HTMLTableRowElement>}
     */
    $getRowByDataId(rowDataId) {
        return this.$getOwnedRowByData("id", rowDataId);
    }

    /**
     * @param dataKey {string}
     * @param dataValue {string|number}
     * @return {jQuery<HTMLTableRowElement>}
     */
    $getOwnedRowByData(dataKey, dataValue) {
        return this.$tbody.children(this.getRowSelector(dataKey, dataValue));
    }

    /**
     * @returns {string}
     */
    getRowSelector(dataKey, dataValue) {
        return `tr${this.ownerSelector}[data-${dataKey}='${dataValue}']`;
    }

    /**
     * @returns {string}
     */
    get ownerSelector() {
        return `[data-owner='${this.owner}']`;
    }

    get columnsCount() {
        let columnsCount = 0;
        const firstRow = this.$firstRow;
        if (!firstRow.length) {
            const tableColumnsCount = this.$table.data("columns-count");
            return tableColumnsCount ? +tableColumnsCount : 1; // default to 1 column
        }
        let tds = firstRow.children("th");
        if (!tds.length) {
            tds = firstRow.children("td");
        }
        for (let td of tds) {
            const colspan = $(td).attr('colspan');
            if (colspan) {
                columnsCount += +colspan;
            } else {
                columnsCount++;
            }
        }
        return columnsCount;
    }

    /**
     * @returns {jQuery<HTMLTableElement>}
     */
    get $table() {
        return this._$table;
    }

    get tableId() {
        return this._tableId;
    }

    /**
     * @returns {jQuery<HTMLBodyElement>}
     */
    get $tbody() {
        if (!this._$tbody.length) {
            this.$table.append("<tbody></tbody>");
        }
        return this._$tbody;
    }

    /**
     * @returns {jQuery<HTMLBodyElement>}
     */
    get _$tbody() {
        return this.$table.children("tbody");
    }

    /**
     * @returns {jQuery<HTMLTableRowElement>}
     */
    get $firstRow() {
        return this.$tbody.children("tr:nth-child(1)");
    }

    /**
     * @returns {string}
     */
    get owner() {
        return this._owner;
    }
}
