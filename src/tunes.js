import { make } from './ui';
import bgIcon from './svg/background.svg';
import borderIcon from './svg/border.svg';
import stretchedIcon from './svg/stretched.svg';
import editIcon from './svg/edit.svg';

/**
 * Working with Block Tunes
 */
export default class Tunes {
  /**
   * @param {object} tune - image tool Tunes managers
   * @param {object} tune.api - Editor API
   * @param {object} tune.actions - list of user defined tunes
   * @param {Function} tune.onChange - tune toggling callback
   */
  constructor({ api, actions, onChange, setImageStyle }) {
    this.api = api;
    this.actions = actions;
    this.onChange = onChange;
    this.setImageStyle = setImageStyle;
    this.buttons = [];
  }

  /**
   * Available Image tunes
   *
   * @returns {{name: string, icon: string, title: string}[]}
   */
  static get tunes() {
    return [
      {
        name: 'withBorder',
        icon: borderIcon,
        title: 'With border',
      },
      {
        name: 'stretched',
        icon: stretchedIcon,
        title: 'Stretch image',
      },
      {
        name: 'withBackground',
        icon: bgIcon,
        title: 'With background',
      }
    ];
  }

  /**
   * Styles
   *
   * @returns {{wrapper: string, buttonBase: *, button: string, buttonActive:
   *   *}}
   */
  get CSS() {
    return {
      wrapper: '',
      buttonBase: this.api.styles.settingsButton,
      button: 'image-tool__tune',
      buttonActive: this.api.styles.settingsButtonActive,
    };
  }

  /**
   * Makes buttons with tunes: add background, add border, stretch image
   *
   * @param {ImageToolData} toolData - generate Elements of tunes
   * @param {ImageConfig} config - The config.
   * @returns {Element}
   */
  render(toolData, config) {
    const wrapper = make('div', this.CSS.wrapper);

    this.buttons = [];

    const tunes = Tunes.tunes.concat(this.actions);
    tunes.forEach(tune => {
      const title = this.api.i18n.t(tune.title);
      const el = make('div', [this.CSS.buttonBase, this.CSS.button], {
        innerHTML: tune.icon,
        title,
      });
      el.addEventListener('click', () => {
        this.tuneClicked(tune.name, tune.action);
      });

      el.dataset.tune = tune.name;
      el.classList.toggle(this.CSS.buttonActive, toolData[tune.name]);

      this.buttons.push(el);

      this.api.tooltip.onHover(el, title, {
        placement: 'top',
      });

      wrapper.appendChild(el);
    });


    // Add button for choose image style.
    const title = this.api.i18n.t('Choose image style');
    const el = make('div', [this.CSS.buttonBase, this.CSS.button], {
      innerHTML: editIcon,
      title,
    });
    el.addEventListener('click', () => {
      const imageStyleEl = el.parentElement.querySelector('.choose_image_style');
      if (!imageStyleEl) {
        this.makeImageSelect(el, config.imageStyles, toolData['image_style'])
      }
      else {
        imageStyleEl.classList.toggle('showed', !imageStyleEl.classList.contains('showed'))
      }
    });

    el.dataset.tune = 'image_style';
    el.classList.toggle(this.CSS.buttonActive, toolData[el.dataset.tune]);

    this.buttons.push(el);

    this.api.tooltip.onHover(el, title, {
      placement: 'top',
    });

    wrapper.appendChild(el);
    return wrapper;
  }

  /**
   * Clicks to one of the tunes
   *
   * @param {string} tuneName - clicked tune name
   * @param {Function} customFunction - function to execute on click
   */
  tuneClicked(tuneName, customFunction) {
    if (typeof customFunction === 'function') {
      if (!customFunction(tuneName)) {
        return false;
      }
    }
    const button = this.buttons.find(el => el.dataset.tune === tuneName);

    button.classList.toggle(this.CSS.buttonActive, !button.classList.contains(this.CSS.buttonActive));
    this.onChange(tuneName);
  }

  /**
   * Make select element for choose image style.
   *
   * @param {Element} tuneEl
   * @param {array} styles
   * @param {string} currentImageStyle
   */
  makeImageSelect(tuneEl, styles, currentImageStyle) {
    const select = make('div', ['choose_image_style', 'showed']);
    select.appendChild(make('div', 'label', {'innerHTML': 'Choose image style'}));
    const list = make('div', 'list_styles');
    Object.keys(styles).map((id) => {
      let classes = ['style_id'];
      if (currentImageStyle === id) {
        classes.push('active');
      }
      let item = make('div', classes, {
        'innerHTML': styles[id],
      })
      item.dataset.value = id;
      list.appendChild(item)
    })
    select.appendChild(list);
    select.addEventListener('click', (e) => {
      if (e.target.classList.contains('style_id')) {
        this.setImageStyle(e.target.dataset.value)
        list.querySelector('.style_id.active').classList.toggle('active', false);
        e.target.classList.toggle('active', true);
      }
    })
    tuneEl.parentElement.appendChild(select);
  }

}
