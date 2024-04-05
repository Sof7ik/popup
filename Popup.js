/**
 * Класс для работы с модальными окнами
 * @author Leonid Bychkov <bychkov.l47@mail.ru>
 * @version 1.0.1
 * */
class Popup {
    /**
     * Была ли ошибка при создании объекта?
     * @private
     * @type {boolean}
     */
    #hasError = false;

    /**
     * Информация об ошибки при создании
     * @private
     * @type {array}
     */
    #errorInfo = [];

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
     * Класс, который добавляется на <span style="font-family: monospace;">&lt;body&gt;</span> и <span style="font-family: monospace;">&lt;html&gt;</span> при открытии модального окна, чтобы убрать прокурутку страницы
     * @type {string}
     * @default not-scrollable
     */
    bodyScrollDisabledClass = "not-scrollable";

    /**
     * Кнопки для закрытия модального окна
     * @type {NodeList}
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
        element: document.querySelector(".bg-darkener"), activeClass: "showed"
    }

    /**
     * Требуется ли подтверждение закрытия модального окна?
     * @type {boolean}
     * @default false
     */
    needCloseConfirm = false;

    /**
     * Открыто ли модальное окно?
     * @private
     * @type {boolean}
     * @default false
     */
    #isOpened = false;

    /**
     * Открытие модального окна, привязанное к контексту объекта класса Popup
     * @private
     * @type {function}
     */
    _open_MethodBinded = function () {
    };

    /**
     * Закрытие модального окна, привязанное к контексту объекта класса Popup
     * @private
     * @type {function}
     */
    _close_MethodBinded = function () {
    };

    /**
     * Закрытие модального окна по клику на оверлей, привязанное к контексту объекта класса Popup
     * @private
     * @type {function}
     */
    _closeByOverlayHandler_MethodBinded = function () {
    };

    /**
     * Закрытие модального окна по кнопке Escape, привязанное к контексту объекта класса Popup
     * @private
     * @type {function}
     */
    _closeByEscapeHandler_MethodBinded = function () {
    };

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
        if (typeof selector === "string") {
            this.popupElem = document.querySelector(selector);
        } else if (typeof selector === "object" && (selector instanceof HTMLDivElement || selector instanceof HTMLElement)) {
            this.popupElem = selector;
        } else {
            const err = "Неправильный тип селектора";
            console.error(err)
            this.#errorInfo.push(err)
            this.#hasError = true;
            return;
        }

        if (!this.popupElem) {
            const err = "Не был задан селектор для popup-а";
            console.error(err);
            this.#errorInfo.push(err)
            this.#hasError = true;
            return;
        }

        // if (!options) {
        //     const err = "Не указан объект настроек";
        //     console.error(err);
        //     this.#errorInfo.push(err)
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
                else if (typeof options.bgDarkener.element === "object" && (options.bgDarkener.element instanceof HTMLDivElement || options.bgDarkener.element instanceof HTMLElement)) {
                    this.bgDarkener.element = options.bgDarkener.element;
                }
            }

            // если в настройках передан активный класс для затемнения заднего фона
            this.bgDarkener.activeClass = options.bgDarkener.activeClass ?? this.bgDarkener.activeClass;
        }

        this._open_MethodBinded = this.open.bind(this);
        this._close_MethodBinded = this.close.bind(this);

        // получение всех кнопок закрытия и навешивание слушателей
        this.#closeButtons = this.popupElem.querySelectorAll("[data-close]");
        Array.from(this.#closeButtons).forEach(button => {
            button.addEventListener("click", this._close_MethodBinded)
        })

        if (this.closeByClickingOverlay) {
            this._closeByOverlayHandler_MethodBinded = this._closeByOverlayHandler.bind(this);
        }

        if (this.closeByEscape) {
            this._closeByEscapeHandler_MethodBinded = this._closeByEscapeHandler.bind(this);
        }
    }

    /**
     * Есть ли ошибка при создании объекта?
     * @public
     * @return {{hasError: boolean, errors: array}}
     * */
    hasError() {
        return {
            hasError: this.#hasError, errors: this.#errorInfo
        };
    }

    /**
     * Открыто ли модальное окно?
     * @public
     * @returns {boolean}
     */
    isOpened() {
        return this.#isOpened;
    }

    /**
     * Получить коллекцию кнопок для закрытия модального окна
     * @public
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
    open(event) {
        if (this.#hasError) {
            console.error("Объект был создан с ошибкой. Изучите логи в консоли");
            return;
        }

        this.popupElem.classList.add(this.activeClass);

        document.body.classList.add(this.bodyScrollDisabledClass);
        document.querySelector("html").classList.add(this.bodyScrollDisabledClass);

        this.bgDarkener.element.classList.add(this.bgDarkener.activeClass);

        if (this.closeByClickingOverlay) {
            this.popupElem.addEventListener("click", this._closeByOverlayHandler_MethodBinded)
        }

        if (this.closeByEscape) {
            document.addEventListener("keydown", this._closeByEscapeHandler_MethodBinded)
        }

        this.#isOpened = true;
    }

    /**
     * Закрыть модальное окно
     * @public
     * @param {?MouseEvent} event - событие click
     * @param {?boolean} skipClosingBgDarkener - пропустить закрытие темной подложки под модальным окном
     * @default false
     * @return {void}
     * */
    close(event, skipClosingBgDarkener = false) {
        if (this.#hasError) {
            console.error("Объект был создан с ошибкой. Изучите логи в консоли");
            return;
        }

        if (this.needCloseConfirm) {
            const decision = confirm("Вы действительно хотите закрыть модальное окно?");

            if (decision) {
                this._hidePopup(skipClosingBgDarkener);
            }
        } else {
            this._hidePopup(skipClosingBgDarkener);
        }
    }

    /**
     * Закрытие модального окна при клике вне его
     * @private
     * @param {MouseEvent} event - событие click
     * @return {void}
     */
    _closeByOverlayHandler(event) {
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
    _closeByEscapeHandler(event) {
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
    _hidePopup(skipClosingBgDarkener) {
        this.popupElem.classList.remove(this.activeClass);
        document.body.classList.remove(this.bodyScrollDisabledClass);
        document.querySelector("html").classList.remove(this.bodyScrollDisabledClass);

        // если нужно закрыть одну модалку, а вторую показать и не нужно скрывать темный фон
        if (!skipClosingBgDarkener) {
            this.bgDarkener.element.classList.remove(this.bgDarkener.activeClass);
        }

        if (this.closeByClickingOverlay) {
            this.popupElem.removeEventListener("click", this._closeByOverlayHandler_MethodBinded)
        }

        if (this.closeByEscape) {
            document.removeEventListener("keydown", this._closeByEscapeHandler_MethodBinded)
        }

        this.#isOpened = false;
    }
}