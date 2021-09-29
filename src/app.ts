import { html, css, LitElement } from 'lit-element';

export class App extends LitElement {
  async firstUpdated() {}

  render() {
    return html`<div id="app"><h1>Hello Evees</h1></div> `;
  }

  static get styles() {
    return [
      css`
        :host {
          height: 100%;
          flex-direction: column;
          display: flex;
          justify-content: center;
        }

        #app {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: auto;
        }
      `,
    ];
  }
}
