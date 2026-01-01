$(document).ready(function() {
    $('#action-btn').click(function() {
        // 1. Изменить заголовок
        $('#page-title').text('Задание выполнено!');
        
        // 2. Покрасить 
        $('#todo-list li').each(function(index) {
            if (index % 2 === 0) {
                $(this).addClass('odd').removeClass('even');
            } else {
                $(this).addClass('even').removeClass('odd');
            }
        });
        
        // 3. Добавить пункт
        $('#todo-list').append('<li>Изучить jQuery</li>');
        $('#todo-list li:last').addClass('even');
        
        
        $(this).prop('disabled', true).text('Задания выполнены');
    });
});