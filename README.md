# Класс для работы с модальными окнами
Класс позволяет удобно использовать открытие и закрытие модальных окон.

**Документацию к описанию методов и свойств можно прочитать по ссылке под 
описанием репозитория справа**

## Использование
### Скачать архив из последнего релиза на GitHub.

### Подключить скрипт к странице
* 1С-Битрикс
 ```php
 use Bitrix\Main\Page\Asset;
 $asset = Asset::getInstance();
 $asset->addJs(SITE_TEMPLATE_PATH."/vendor/popup/Popup.js");
 ```
* Html
```html
 <head>
     ...
     <script src="path/to/folder/Popup.js"></script>
 </head>
 ```
### Сверстать модальное окно
```html
<!-- Само модальное окно -->
<div class="modal" id="callback-modal">
    <div class="modal__content">
        ...
    </div>
</div>

<!-- Затемнение фона -->
<div class="bg-darkener"></div>
```

### Задать стили модальному окну и темному фону под ним
```css
/* ... */

/* Стили написаны для примера */
.bg-darkener {
   position: fixed;
   left: 0;
   top: 0;
   width: 100%;
   height: 100vh;
   z-index: 5;
   
   background-color: rgba(0, 0, 0, 0.6);

   opacity: 0;
   pointer-events: none;

   transition: opacity .3s;
}

.bg-darkener.showed {
   opacity: 1;
   pointer-events: all;
}

.modal {
   position: fixed;
   left: 0;
   top: 0;
   width: 100%;
   height: 100vh;
   z-index: 10;
   
   opacity: 0;
   pointer-events: none;
   
   transition: opacity .3s;
}

.modal.showed {
   opacity: 1;
   pointer-events: all;
}

/* ... */
```
Здесь важно запомнить CSS классы, которые прописаны для показа модального 
окна и затемнения фона. В данному случае оба этих класса - ```showed```. По 
умолчанию используется также этот класс

### В JS-файле, где нужно открывать модальное окно
```javascript
/*
Созднание объекта модального окна с параметрами по умолчанию. Подробно 
про них вы можете прочитать в документации к классу по ссылке справа под 
описанием репозитория 
*/

const modal = document.getElementById("callback-modal");

const popup = new Popup(modal);

// открыть модальное окно
popup.open();

// закрыть модальное окно
popup.close()

// установить подтверждение закрытия модального окна
popup.needCloseConfirm = true;

popup.open()
        
/* Теперь перед закрытием окна пользователю покажется браузерный confirm с 
уточнением */
popup.close();
```