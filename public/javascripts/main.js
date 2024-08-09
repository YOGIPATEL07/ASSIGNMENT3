document.addEventListener('DOMContentLoaded', function() {
    // Confirm before submitting edit forms
    document.querySelectorAll('form[id^="edit"]').forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!confirm('Are you sure you want to update this item?')) {
                event.preventDefault();
            }
        });
    });

    // Confirm before submitting delete forms
    document.querySelectorAll('form.deleteForm').forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!confirm('Are you sure you want to delete this item?')) {
                event.preventDefault();
            }
        });
    });
});
