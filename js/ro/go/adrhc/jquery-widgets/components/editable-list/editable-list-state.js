class EditableListState extends SelectableListState {
    _doAfterSwitch(previousSelectableSwappingData, newSelectableSwappingData) {
        super._doAfterSwitch(previousSelectableSwappingData, newSelectableSwappingData);
        if (previousSelectableSwappingData &&
            EntityUtils.isTransientId(previousSelectableSwappingData.itemId)) {
            // previous switch exist and is transient
            this.removeTransient();
        }
    }
}