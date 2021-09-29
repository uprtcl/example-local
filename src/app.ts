import { html, css, LitElement, internalProperty, query } from 'lit-element';

import { servicesConnect } from '@uprtcl/evees-ui';
import { Entity } from '@uprtcl/evees';

interface Note {
  text: string;
}

/** In LitElement we uses the `servicesConnect` function to inject
 * the evees service into a web-component at run-time. */
export class App extends servicesConnect(LitElement) {
  @internalProperty()
  notes: Map<string, Entity<Note>> = new Map();

  @query('#new-note')
  textearea: HTMLTextAreaElement;

  async firstUpdated() {
    console.log(`The evees service is injected under this.evees`, {
      evees: this.evees,
    });

    /** load all notes */
    await this.loadNotes();
  }

  async loadNotes() {
    /** explore without input parameters will return all known perspectives/notes */
    const result = await this.evees.explore({});
    this.notes = new Map();

    await Promise.all(
      result.perspectiveIds.reverse().map(async (noteId) => {
        const note = await this.evees.getPerspectiveData<Note>(noteId);
        this.notes.set(noteId, note);
      })
    );

    // re-render
    this.requestUpdate();
  }

  async createNote() {
    const text = this.textearea.value;
    await this.evees.createEvee({ object: { text } });

    this.textearea.value = '';
    this.textearea.focus();

    await this.evees.flush();
    await this.loadNotes();

    // re-render
    this.requestUpdate();
  }

  async updateNote(noteId: string, text: string) {
    await this.evees.updatePerspectiveData({
      perspectiveId: noteId,
      object: { text },
    });

    await this.evees.flush();

    // re-render
    this.requestUpdate();
  }

  async deleteNote(noteId: string) {
    await this.evees.deletePerspective(noteId);
    await this.evees.flush();

    await this.loadNotes();
  }

  render() {
    return html`<div id="app">
      <h1>Hello Evees</h1>
      <textarea id="new-note"></textarea
      ><button @click=${() => this.createNote()}>create</button>
      ${Array.from(this.notes.keys()).map(
        (noteId) =>
          html`<div class="row">
            <uprtcl-popper
              class="evees-info"
              skinny
              icon="two_dots"
              position="right"
            >
              <uprtcl-card>
                <evees-info-debug uref=${noteId}></evees-info-debug
              ></uprtcl-card>
            </uprtcl-popper>
            <div class="card">${this.notes.get(noteId).object.text}</div>
            <uprtcl-icon-button
              icon="clear"
              button
              @click=${() => this.deleteNote(noteId)}
            ></uprtcl-icon-button>
          </div>`
      )}
    </div> `;
  }

  static get styles() {
    return [
      css`
        #app {
          padding: 10vw 10vw;
          max-width: 600px;
        }

        textarea {
          resize: vertical;
          padding: 2vw;
          width: calc(100% - 4vw);
        }

        button {
          width: 100%;
          margin-top: 2vw;
          margin-bottom: 6vw;
          padding: 1vw;
          background-color: #405886;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: white;
        }

        button:hover {
          background-color: #203152;
        }

        .card {
          padding: 2vw;
          border: 1px solid;
          border-radius: 5px;
          flex-grow: 1;
        }

        .row {
          display: flex;
          align-items: center;
          margin-bottom: 2vw;
        }

        .evees-info {
          flex-grow: 0;
          margin: 0px 1vw;
        }

        uprtcl-icon-button {
          margin: 0px 1vw;
        }
      `,
    ];
  }
}
