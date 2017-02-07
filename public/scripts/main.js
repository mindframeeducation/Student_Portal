/* global $ */

// var searchBtn = document.querySelector(".search-button");
$(document).ready(function(){
	$('.ui.checkbox').checkbox();
	$('.ui.progress').progress({
		showActivity: false
	});
	$('.ui.accordion').accordion();
  $('table').tablesort();
  $('.ui.dropdown').dropdown();
  $('.ui.form')
  .form({
    fields: {
      email: {
        identifier: 'username',
        rules: [
          {
            type: 'email',
            prompt: 'Please enter a valid email address'
          }
        ]
      },
      
      password: {
        identifier: 'password',
        rules: [
          {
            type    : 'empty',
            prompt  : 'Please enter your password'
          }
        ]
      },
      
      confirm_password: {
        identifier: 'confirm_password',
        rules: [
          {
            type  : 'match[password]',
            prompt: 'Passwords do not match!'
          }
        ]
      },
    }
  });
});

// Auto timeout messages
window.setTimeout(function() {
    $(".ui.success.message.small.overlay").transition();
    $(".ui.negative.message.small.overlay").transition();
}, 1500);

$('#ddl').dropdown();

$('.message .close').on('click', function() {
  $(this).closest('.message').fadeOut();
});

$(".small.modal.student").modal('setting', {observeChanges: true} ).modal('setting', 'transition', "Fade Down").modal("attach events", "#editStudent", "show");
$(".small.modal.goal").modal('setting', {observeChanges: true} ).modal('setting', 'transition', "Fade Down").modal("attach events", "#editGoal", "show");
$(".small.modal.email").modal('setting', {observeChanges: true} ).modal('setting', 'transition', "Fade Down").modal("attach events", "#addEmail", "show");
$(".small.modal.class").modal('setting', {observeChanges: true} ).modal('setting', 'transition', "Fade Down").modal("attach events", "#addClass", "show");
$(".small.modal.course").modal('setting', {observeChanges: true} ).modal('setting', 'transition', "Fade Down").modal("attach events", "#addCourse", "show");

// var deleteModal = $(".ui.small.modal.delete.class").length;
// console.log("The length is: " + deleteModal);
// for (var i = 0; i < $(".ui.small.modal.delete").length; i++) {
// 	(function(i){
// 		$(".delete-class-button-" + i).click(function(){
// 			$("#delete-modal-" + i).modal("show");
// 		});
// 	}(i));
// }

// This will also works (using let, which is a in ES6)
// Initialize delete class modal
for (let i = 0; i < $(".ui.small.modal.delete.class").length; i++) {
	$(".delete-class-button-" + i).click(function(){
		$("#delete-class-" + i).modal("show");
	});
}

// Initialize delete email modal
for (let i = 0; i < $(".ui.small.modal.delete.email").length; i++) {
	$(".delete-email-button-" + i).click(function(){
		$("#delete-email-" + i).modal("show");
	});
}

// Initialize delete entry modal
for (let i = 0; i < $(".ui.small.modal.delete.entry").length; i++){
	$(".delete-entry-button-" + i).click(function(){
		$("#delete-entry-" + i).modal("show");
	});
}

// Initialize add unit modal
for (let i = 0; i < $(".ui.small.modal.unit").length; i++) {
	$("#add-unit-button-" + i).click(function(){
		$("#add-unit-modal-" + i).modal("show");
	});
	console.log("The total component is: " + $(".ui.small.modal.unit").length);
	console.log("And ther are: " + $(".ui.small.modal.unit"));
}

// Initialize change course name modal
for (let i = 0; i < $(".ui.small.modal.course.name").length; i++) {
	$("#course-name-button-" + i).click(function(){
		$("#change-course-name-" + i).modal("show");
	});
}

// Initialize the modal for removing courses from the students' profiles
for (let i = 0; i < $(".ui.small.modal.remove.course.student").length; i++) {
	$("#remove-course-student-button-" + i).click(function(){
		$("#remove-course-student-modal-" + i).modal("show");
	});
}

// Initiliaze modal for editing entry
for (let i = 0; i < $(".ui.small.modal.edit.entry").length; i++){
	$("#edit-entry-button-" + i).click(function(){
		$("#edit-entry-modal-" + i).modal({
			autofocus: false,
			observeChanges: true
		}).modal("show");
	});
}

$(".close.icon").click(function(){
	$(".small.modal").modal("hide");
});

$(".close-modal").click(function(){
	$(".small.modal").modal("hide");
});

// Sortable starts
/*
	A simple, lightweight jQuery plugin for creating sortable tables.
	https://github.com/kylefox/jquery-tablesort
	Version 0.0.11
*/

(function($) {
	$.tablesort = function ($table, settings) {
		var self = this;
		this.$table = $table;
		this.$thead = this.$table.find('thead');
		this.settings = $.extend({}, $.tablesort.defaults, settings);
		this.$sortCells = this.$thead.length > 0 ? this.$thead.find('th:not(.no-sort)') : this.$table.find('th:not(.no-sort)');
		this.$sortCells.on('click.tablesort', function() {
			self.sort($(this));
		});
		this.index = null;
		this.$th = null;
		this.direction = null;
	};

	$.tablesort.prototype = {

		sort: function(th, direction) {
			var start = new Date(),
				self = this,
				table = this.$table,
				rowsContainer = table.find('tbody').length > 0 ? table.find('tbody') : table,
				rows = rowsContainer.find('tr').has('td, th'),
				cells = rows.find(':nth-child(' + (th.index() + 1) + ')').filter('td, th'),
				sortBy = th.data().sortBy,
				sortedMap = [];

			var unsortedValues = cells.map(function(idx, cell) {
				if (sortBy)
					return (typeof sortBy === 'function') ? sortBy($(th), $(cell), self) : sortBy;
				return ($(this).data().sortValue != null ? $(this).data().sortValue : $(this).text());
			});
			if (unsortedValues.length === 0) return;

			//click on a different column
			if (this.index !== th.index()) {
				this.direction = 'asc';
				this.index = th.index();
			}
			else if (direction !== 'asc' && direction !== 'desc')
				this.direction = this.direction === 'asc' ? 'desc' : 'asc';
			else
				this.direction = direction;

			direction = this.direction == 'asc' ? 1 : -1;

			self.$table.trigger('tablesort:start', [self]);
			self.log("Sorting by " + this.index + ' ' + this.direction);

			// Try to force a browser redraw
			self.$table.css("display");
			// Run sorting asynchronously on a timeout to force browser redraw after
			// `tablesort:start` callback. Also avoids locking up the browser too much.
			setTimeout(function() {
				self.$sortCells.removeClass(self.settings.asc + ' ' + self.settings.desc);
				for (var i = 0, length = unsortedValues.length; i < length; i++)
				{
					sortedMap.push({
						index: i,
						cell: cells[i],
						row: rows[i],
						value: unsortedValues[i]
					});
				}

				sortedMap.sort(function(a, b) {
					return self.settings.compare(a.value, b.value) * direction;
				});

				$.each(sortedMap, function(i, entry) {
					rowsContainer.append(entry.row);
				});

				th.addClass(self.settings[self.direction]);

				self.log('Sort finished in ' + ((new Date()).getTime() - start.getTime()) + 'ms');
				self.$table.trigger('tablesort:complete', [self]);
				//Try to force a browser redraw
				self.$table.css("display");
			}, unsortedValues.length > 2000 ? 200 : 10);
		},

		log: function(msg) {
			if(($.tablesort.DEBUG || this.settings.debug) && console && console.log) {
				console.log('[tablesort] ' + msg);
			}
		},

		destroy: function() {
			this.$sortCells.off('click.tablesort');
			this.$table.data('tablesort', null);
			return null;
		}

	};

	$.tablesort.DEBUG = false;

	$.tablesort.defaults = {
		debug: $.tablesort.DEBUG,
		asc: 'sorted ascending',
		desc: 'sorted descending',
		compare: function(a, b) {
			if (a > b) {
				return 1;
			} else if (a < b) {
				return -1;
			} else {
				return 0;
			}
		}
	};

	$.fn.tablesort = function(settings) {
		var table, sortable, previous;
		return this.each(function() {
			table = $(this);
			previous = table.data('tablesort');
			if(previous) {
				previous.destroy();
			}
			table.data('tablesort', new $.tablesort(table, settings));
		});
	};

})(window.Zepto || window.jQuery);
// Sortable ends
