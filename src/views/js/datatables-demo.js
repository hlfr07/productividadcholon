// Call the dataTables jQuery plugin
$(document).ready(function() {
  $('#dataTable').DataTable({
      "order": [[0, "desc"]]  // Ordena por la columna de índice 3 (Edad) de mayor a menor
  });
});
