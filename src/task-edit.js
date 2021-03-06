import {days} from './utils';
import Component from './component';
import flatpickr from "flatpickr";
import moment from 'moment';

export default class TaskEdit extends Component {

  constructor(data) {
    super();
    this._title = data.title;
    this._dueDate = data.dueDate;
    this._tags = data.tags;
    this._picture = data.picture;
    this._color = data.color;
    this._repeatingDays = data.repeatingDays;
    this._onSubmit = null;
    this._onDelete = null;
    this._state.isDate = false;
    this._state.isRepeated = false;

    this._onChangeDate = this._onChangeDate.bind(this);
    this._onChangeRepeated = this._onChangeRepeated.bind(this);
    this._onSubmitButtonClick = this._onSubmitButtonClick.bind(this);
    this._clickOnDelete = this._clickOnDelete.bind(this);
  }

  update(data) {
    this._title = data.title;
    this._dueDate = data.dueDate;
    this._tags = data.tags;
    this._color = data.color;
    this._repeatingDays = data.repeatingDays;
  }

  static createMapper(target) {
    let fullDate = ``;
    return {
      hashtag: (value) => target.tags.push(value),
      text: (value) => (target.title = value),
      color: (value) => (target.color = value),
      repeat: (value) => (target.repeatingDays[value] = true),
      date: (value) => (fullDate = value),
      time: (value) => {
        fullDate += value;
        target.dueDate = new Date(fullDate);
      },
    };
  }

  _onChangeDate() {
    this._state.isDate = !this._state.isDate;
    this.removeListeners();
    this._partialUpdate();
    this.createListeners();
  }

  _onChangeRepeated() {
    this._state.isRepeated = !this._state.isRepeated;
    this.removeListeners();
    this._partialUpdate();
    this.createListeners();
  }

  _isRepeated() {
    return Object.values(this._repeatingDays).some((it) => it === true);
  }

  _partialUpdate() {
    this._element.innerHTML = this.template;
  }

  _processForm(formData) {
    const entry = {
      title: ``,
      color: ``,
      tags: [],
      dueDate: new Date(),
      repeatingDays: {
        'mo': false,
        'tu': false,
        'we': false,
        'th': false,
        'fr': false,
        'sa': false,
        'su': false,
      }
    };

    const taskEditMapper = TaskEdit.createMapper(entry);

    Array.from(formData.entries()).forEach(
        ([property, value]) => taskEditMapper[property] && taskEditMapper[property](value)
    );

    return entry;
  }

  _onSubmitButtonClick(evt) {
    evt.preventDefault();
    const formData = new FormData(this._element.querySelector(`.card__form`));
    const newData = this._processForm(formData);
    if (typeof this._onSubmit === `function` && this._onSubmit(newData)) {
      this.update(newData);
    }

  }

  _clickOnDelete() {
    return typeof this._onDelete === `function` && this._onDelete();
  }

  set onSubmit(fn) {
    this._onSubmit = fn;
  }

  set onDelete(fn) {
    this._onDelete = fn;
  }

  get template() {
    return `
        <article class="card card--edit card--${this._color} ${this._isRepeated() ? `card--repeat` : ``}">
              
              <form class="card__form" method="get">
                <div class="card__inner">
                  <div class="card__control">
                    <button type="button" class="card__btn card__btn--edit">
                      edit
                    </button>
  
                    <button type="button" 
                    class="card__btn card__btn--archive">
                     archive
                    </button>
                    
                    <button
                      type="button"
                      class="card__btn card__btn--favorites">
                    favorites
                  </button>
                </div>

                <div class="card__color-bar">
                  <svg class="card__color-bar-wave" width="100%" height="10">
                    <use xlink:href="#wave"></use>
                  </svg>
                </div>

                <div class="card__textarea-wrap">
                  <label>
                    <textarea
                      class="card__text"
                      placeholder="Start typing your text here..."
                      name="text"
                    >${this._title}</textarea>
                  </label>
                </div>

                <div class="card__settings">
                  <div class="card__details">
                    <div class="card__dates">
                      <button class="card__date-deadline-toggle" type="button">
                        date: <span class="card__date-status">${this._state.isDate ? `yes` : `no`}</span>
                        </button>
  
                        <fieldset class="card__date-deadline" ${!this._state.isDate && `disabled`}>
                            <label class="card__input-deadline-wrap">
                              <input
                                class="card__date"
                                type="text"
     placeholder="23 September" name="date"
                              value="${moment(this._dueDate).format(`DD MMMM`)}"/>
                          </label>
                          <label class="card__input-deadline-wrap">
                            <input
                              class="card__time"
                              type="text"
  placeholder="11:15 PM"  name="time"
  value="${moment(this._dueDate).format(`LT`)}"
                            />
                          </label>
                        </fieldset>
  
                        <button class="card__repeat-toggle" type="button">
                          repeat:<span class="card__repeat-status">${this._state.isRepeated ? `yes` : `no`}</span>
                        </button>
  
                        <fieldset class="card__repeat-days" ${!this._state.isRepeated && `disabled`}>
                            <div class="card__repeat-days-inner">
${days(this._repeatingDays)}
                        </div>
                      </fieldset>
                    </div>

                    <div class="card__hashtag">
                      <div class="card__hashtag-list">${(this._tags).map((tag)=>{
    return `<span class="card__hashtag-inner">
                          <input
                            type="hidden"
                            name="hashtag"
                            value="${tag}"
                            class="card__hashtag-hidden-input"
                          />
                          <button type="button" class="card__hashtag-name">
                            #${tag}
                          </button>
                          <button type="button" class="card__hashtag-delete">
                            delete
                          </button>
                        </span>`;
  }).join(``)}</div>
                      <label>
                        <input
                          type="text"
                          class="card__hashtag-input"
                          name="hashtag-input"
                          placeholder="Type new hashtag here"
                        />
                      </label>
                    </div>
                  </div>

                  <label class="card__img-wrap">
                    <input
                      type="file"
                      class="card__img-input visually-hidden"
                      name="img"
                    />
                    <img
                      src="${this._picture}"
                      alt="task picture"
                      class="card__img"
                    />
                  </label>

                  <div class="card__colors-inner">
                    <h3 class="card__colors-title">Color</h3>
                    <div class="card__colors-wrap">
                      <input
                        type="radio"
                        id="color-black-6"
                        class="card__color-input card__color-input--black visually-hidden"
                        name="color"
                        value="black"
                        ${this._color === `black` && `checked`}
                        />
                        <label
                          for="color-black-6"
                          class="card__color card__color--black"
                          >black</label
                        >
                        <input
                          type="radio"
                          id="color-yellow-6"
                          class="card__color-input card__color-input--yellow visually-hidden"
                          name="color"
                          value="yellow"
                          ${this._color === `yellow` && `checked`}
                          />
                          <label
                            for="color-yellow-6"
                            class="card__color card__color--yellow"
                            >yellow</label
                          >
                          <input
                            type="radio"
                            id="color-blue-6"
                            class="card__color-input card__color-input--blue visually-hidden"
                            name="color"
                            value="blue"
                             ${this._color === `blue` && `checked`}
                            />
                            <label
                              for="color-blue-6"
                              class="card__color card__color--blue"
                              >blue</label
                            >
                            <input
                              type="radio"
                              id="color-green-6"
                              class="card__color-input card__color-input--green visually-hidden"
                              name="color"
                              value="green"
                              ${this._color === `green` && `checked`}
                              />
                              <label
                                for="color-green-6"
                                class="card__color card__color--green"
                                >green</label
                              >
                              <input
                                type="radio"
                                id="color-pink-6"
                                class="card__color-input card__color-input--pink visually-hidden"
                                name="color"
                                value="pink"
                                ${this._color === `pink` && `checked`}
                                />
                                <label
                                  for="color-pink-6"
                                  class="card__color card__color--pink"
                                  >pink</label
                                >
                              </div>
                            </div>
                          </div>
          
                          <div class="card__status-btns">
                            <button class="card__save" type="submit">save</button>
                            <button class="card__delete" type="button">delete</button>
                          </div>
                        </div>
                      </form>
                    </article>
`.trim();
  }

  createListeners() {
    this._element.querySelector(`.card__form`)
      .addEventListener(`submit`, this._onSubmitButtonClick);
    this._element.querySelector(`.card__date-deadline-toggle`)
      .addEventListener(`click`, this._onChangeDate);
    this._element.querySelector(`.card__repeat-toggle`)
      .addEventListener(`click`, this._onChangeRepeated);
    if (this._state.isDate) {
      flatpickr(this._element.querySelector(`.card__date`), {altInput: true, altFormat: `j F`, dateFormat: `j F`});
      flatpickr(this._element.querySelector(`.card__time`), {
        enableTime: true,
        noCalendar: true,
        altInput: true,
        altFormat: `h:i K`,
        dateFormat: `h:i K`
      });
    }
    this._element.querySelector(`.card__delete`)
      .addEventListener(`click`, this._clickOnDelete);
  }

  removeListeners() {
    this._element.querySelector(`.card__form`)
      .removeEventListener(`submit`, this._onSubmitButtonClick);
    this._element.querySelector(`.card__date-deadline-toggle`)
      .removeEventListener(`click`, this._onChangeDate);
    this._element.querySelector(`.card__repeat-toggle`)
      .removeEventListener(`click`, this._onChangeRepeated);
  }

}
