$(document).ready(function() {
    
    
    // Проверка при потере фокуса
    $('#name').blur(function() {
        if ($(this).val().trim() === '') {
            $(this).addClass('error');
        } else {
            $(this).removeClass('error');
        }
    });
    
    // Обработка отправки формы
    $('#submit-btn').click(function() {
        var name = $('#name').val().trim();
        
        if (name === '') {
            alert('Введите имя!');
            $('#name').focus();
            return;
        }
        
        $('#greeting').html('<div class="success">Привет, ' + name + '!</div>');
    });
    
   
    
    // Анимация
    $('#animate-btn').click(function() {
        $('#color-box').animate({
            width: '200px',
            height: '50px',
            borderRadius: '25px'
        }, 500).animate({
            width: '100px',
            height: '100px',
            borderRadius: '0'
        }, 500);
    });
    
    // Скрыть/показать
    $('#hide-btn').click(function() {
        $('#toggle-text').toggle('fast');
        
        if ($('#toggle-text').is(':visible')) {
            $(this).text('Скрыть текст');
        } else {
            $(this).text('Показать текст');
        }
    });
});