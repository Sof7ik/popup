/**
 * Класс для работы с модальными окнами
 * @author Leonid Bychkov <bychkov.l47@mail.ru>
 * @version 1.0.0
 * */
class Popup {
    /**
     * Была ли ошибка при создании объекта?
     * @private
     * @type {boolean}
     */
    #hasError = false;

    /**
     * Элемент модального окна, который нужно скрывать/показывать
     * @type {Element}
     */
    popupElem = null;

    /**
     * CSS класс, который добавляется для открытия модального окна
     * @type {string}
     * @default showed
     */
    activeClass = "showed";

    /**
     * Класс, который добавляется на <body> и <html> при открытии модального окна, чтобы убрать прокурутку страницы
     * @type {string}
     * @default not-scrollable
     */
    bodyScrollDisabledClass = "not-scrollable";

    /**
     * Кнопки для закрытия модального окна
     * @type {HTMLCollection}
     * @private
     */
    #closeButtons = [];

    /**
     * Закрывать модальное окно при клике на оверлей?
     * @type {boolean}
     * @default true
     */
    closeByClickingOverlay = true;

    /**
     * Закрывать модальное окно по нажатию кнопки Escape?
     * @type {boolean}
     * @default true
     */
    closeByEscape = true;

    /**
     * Объект тёмной подложки под модальным окном
     * @type {object}
     *
     * @property {HTMLElement|HTMLDivElement} element - HTML элемент тёмной подложки
     *
     * @property {string} activeClass - CSS класс, который добавляется для показа тёмной подложки
     * @default {
     *     element: document.querySelector(".bg-darkener"),
     *     activeClass: "showed"
     * }
     *
     * @example
     * // Если вам нужно изменить и HTML Element, и CSS класс открытия
     * popup.bgDarkener {
     *     element: document.querySelector(".page-darkener"),
     *     activeClass: "opened"
     * }
     *
     * // Если нужно изменить или установить только HTML Element
     * popup.bgDarkener.element = document.querySelector(".page-darkener");
     */
    bgDarkener = {
        element: document.querySelector(".bg-darkener"),
        activeClass: "showed"
    }

    /**
     * Требуется ли подтверждение закрытия модального окна?
     * @type {boolean}
     * @default false
     */
    needCloseConfirm = false;

    /**
     * Открытие модального окна, привязанное к контексту объекта класса Popup
     * @private
     * @type {function}
     */
    #open_MethodBinded = function() {};

    /**
     * Закрытие модального окна, привязанное к контексту объекта класса Popup
     * @private
     * @type {function}
     */
    #close_MethodBinded = function() {};

    /**
     * Закрытие модального окна по клику на оверлей, привязанное к контексту объекта класса Popup
     * @private
     * @type {function}
     */
    #closeByOverlayHandler_MethodBinded = function() {};

    /**
     * Закрытие модального окна по кнопке Escape, привязанное к контексту объекта класса Popup
     * @private
     * @type {function}
     */
    #closeByEscapeHandler_MethodBinded = function() {};

    /**
     * Создание объекта модального окна
     *  @param {(HTMLElement|HTMLDivElement|string)} selector - родительский элемент, который нужно скрывать/показывать. Если **```string```**, то это валидный CSS Selector для **```document.querySelector()```**
     *  @param {object} options - объект настроек. Его ключи по названиям полностью совпадают с полями класса
     *
     *  @example
     *  // ----- Создание объекта с настройками по умолчанию. -----
     *  // Элемент модального окна передается элементом
     *  const modal = document.getElementById("callback-modal");
     *  const popupDefault__Element = new Popup(modal);
     *
     *  // Элемент модального окна передается CSS селектором
     *  const popupDefault__Selector = new Popup("#callback-modal");
     *
     *
     *  // ----- Создание объекта с кастомизацией настроек
     *  const modal = document.getElementById("callback-modal");
     *  const popupCustom = new Popup(modal, {
     *      activeClass: "opened",
     *      bodyScrollDisabledClass: "y-hidden",
     *      closeByClickingOverlay: false,
     *      closeByEscape: false,
     *      bgDarkener: {
     *          element: document.querySelector(".page-darkener"),
     *          activeClass: "opened"
     *      },
     *      needCloseConfirm: true
     *  })
     */
    constructor(selector, options = {}) {
        console.log("constructor", selector.constructor.name);
        console.log("constructor 2", selector.constructor.constructor);
        console.log("typeof", typeof selector);

        if (typeof selector === "string") {
            this.popupElem = document.querySelector(selector);
        }
        else if (
            typeof selector === "object" &&
            (selector instanceof HTMLDivElement || selector instanceof HTMLElement)
        ) {
            this.popupElem = selector;
        }
        else {
            console.error("Неправильный тип селектора")
            this.#hasError = true;
            return;
        }

        if (!this.popupElem) {
            console.error("Не был задан селектор для popup-а");
            this.#hasError = true;
            return;
        }

        // if (!options) {
        //     console.error("Не указан объект настроек");
        //     this.#hasError = true;
        //     return;
        // }

        // установка настроек из массива options
        this.activeClass = options.activeClass ?? "showed";
        this.bodyScrollDisabledClass = options.bodyScrollDisabledClass ?? "not-scrollable";
        this.closeByClickingOverlay = options.closeByClickingOverlay ?? true;
        this.closeByEscape = options.closeByEscape ?? true;

        // если в настройки передан объект про затемнение фона
        if (options.bgDarkener) {
            // если в настройках передан элемент затемнителя
            if (options.bgDarkener.element) {
                if (typeof options.bgDarkener.element === "string") {
                    this.bgDarkener.element = document.querySelector(options.bgDarkener.element);
                }
                // если передан div или любой другой элемент
                else if (
                    typeof options.bgDarkener.element === object &&
                    (options.bgDarkener.element instanceof HTMLDivElement ||
                        options.bgDarkener.element instanceof HTMLElement)
                ) {
                    this.bgDarkener.element = options.bgDarkener.element
                }
            }

            // если в настройках передан активный класс для затемнения заднего фона
            this.bgDarkener.activeClass = options.bgDarkener.activeClass ?? this.bgDarkener.activeClass;
        }

        // получение всех кнопок закрытия и навешивание слушателей
        this.#closeButtons = this.popupElem.querySelectorAll("[data-close]");
        this.#closeButtons.forEach(button => {
            button.addEventListener("click", this.close.bind(this))
        })

        this.#open_MethodBinded = this.open.bind(this);
        this.#close_MethodBinded = this.close.bind(this);

        if (this.closeByClickingOverlay) {
            this.#closeByOverlayHandler_MethodBinded = this.#closeByOverlayHandler.bind(this);
        }

        if (this.closeByEscape) {
            this.#closeByEscapeHandler_MethodBinded = this.#closeByEscapeHandler.bind(this);
        }
    }

    /**
     * Есть ли ошибка при создании объекта?
     * @return {boolean}
     * */
    hasError() {
        return this.#hasError;
    }

    /**
     * Получить коллекцию кнопок для закрытия модального окна
     * @return {HTMLCollection}
     */
    getCloseButtons() {
        return this.#closeButtons;
    }

    /**
     * Открыть модальное окно
     * @public
     * @param {MouseEvent} event - событие click
     * @return {void}
     * */
    open (event) {
        if (this.#hasError) {
            console.error("Объект был создан с ошибкой. Изучите логи в консоли");
            return;
        }

        this.popupElem.classList.add(this.activeClass);

        document.body.classList.add(this.bodyScrollDisabledClass);
        document.querySelector("html").classList.add(this.bodyScrollDisabledClass);

        this.bgDarkener.element.classList.add(this.bgDarkener.activeClass);

        if (this.closeByClickingOverlay) {
            this.popupElem.addEventListener("click", this.closeByOverlayHandler_MethodBinded)
        }

        if (this.closeByEscape) {
            document.addEventListener("keydown", this.closeByEscapeHandler_MethodBinded)
        }
    }

    // event = ClickEvent
    /**
     * Закрыть модальное окно
     * @public
     * @param {MouseEvent} event - событие click
     * @param {boolean} skipClosingBgDarkener - пропустить закрытие темной подложки под модальным окном
     * @return {void}
     * */
    close (event, skipClosingBgDarkener) {
        if (this.#hasError) {
            console.error("Объект был создан с ошибкой. Изучите логи в консоли");
            return;
        }

        if (this.needCloseConfirm) {
            const decision = confirm("Вы действительно хотите закрыть модальное окно?");

            if (decision) {
                this.#hidePopup(skipClosingBgDarkener);
            }
        }
        else {
            this.#hidePopup(skipClosingBgDarkener);
        }
    }

    // event = ClickEvent
    /**
     * Закрытие модального окна при клике вне его
     * @private
     * @param {MouseEvent} event - событие click
     * @return {void}
     */
    #closeByOverlayHandler (event) {
        if (event.target === this.popupElem) {
            this.close(null);
        }
    }

    /**
     * Закрытие модального окна по клику на кнопку "Escape"
     * @private
     * @param {KeyboardEvent} event - событие keydown
     * @return {void}
     */
    #closeByEscapeHandler (event) {
        if (event.key === "Escape") {
            this.close(null);
        }
    }

    /**
     * Убирает все классы и слушатели событий
     * @private
     * @param {boolean} skipClosingBgDarkener - пропускать скрытие заднего фона?
     * @return {void}
     */
    #hidePopup(skipClosingBgDarkener) {
        this.popupElem.classList.remove(this.activeClass);
        document.body.classList.remove(this.bodyScrollDisabledClass);
        document.querySelector("html").classList.remove(this.bodyScrollDisabledClass);

        // если нужно закрыть одну модалку, а вторую показать и не нужно скрывать темный фон
        if (!skipClosingBgDarkener) {
            this.bgDarkener.element.classList.remove(this.bgDarkener.activeClass);
        }

        if (this.closeByClickingOverlay) {
            this.popupElem.removeEventListener("click", this.closeByOverlayHandler_MethodBinded)
        }

        if (this.closeByEscape) {
            document.removeEventListener("keydown", this.closeByEscapeHandler_MethodBinded)
        }
    }
}