Template.spreadsheetItem.events({
	'click .btn-delete': function() {
		var idDelete = this._id;
		bootbox.dialog({
			message: "Do you want delete this Spreadsheets",
			title: "Warning",
			buttons: {
				main: {
					label: "Cancel",
					className: "btn-primary"
				},
				danger: {
					label: "Delete",
					className: "btn-danger",
					callback: function() {
						Spreadsheets.remove(idDelete);
					}
				}
			}
		});
	}
})