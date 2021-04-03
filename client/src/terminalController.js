import ComponentBuilder from "./components.js"
import { constants } from "./constants.js"

export default class TerminalController {
  #userCollors = new Map()

  constructor() { }

  #pickCollor() {
    return `#${((1 << 24) * Math.random() | 0).toString(16)}-fg`
  }

  #getUserCollor(userName) {
    if(this.#userCollors.has(userName)) return this.#userCollors.get(userName)

    const collor = this.#pickCollor()
    this.#userCollors.set(userName, collor)

    return collor
  }

  #onInputReceived(eventEmmiter) {
    return function() {
      const message = this.getValue()
      eventEmmiter.emit(constants.events.app.MESSAGE_SENT, message)
      this.clearValue() 
    }
  }

  #onMessageReceived({ screen, chat }) {
    return msg => {
      const { userName, message } = msg
      const collor = this.#getUserCollor(userName)
      chat.addItem(`{${collor}}{bold}${userName}{/}: ${message}`)
      screen.render()
    }

  }

  #onLogChanged({ screen, activityLog }) {
    return msg => {
      const [userName] = msg.split(/\s/)
      const collor = this.#getUserCollor(userName)
      activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`)
      screen.render()
    }
  }

  #onStatusChanged({ screen, status }) {
    return users => {
      const { content } = status.items.shift()
      status.clearItems()
      status.addItem(content)

      users.forEach(userName => {
        const collor = this.#getUserCollor(userName)
        status.addItem(`{${collor}}{bold}${userName}{/}`)
      })

      screen.render()
    }
  }

  #registerEvents(eventEmmitter, components) {
    eventEmmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
    eventEmmitter.on(constants.events.app.ACTIVITYLOG_UPDATED, this.#onLogChanged(components))
    eventEmmitter.on(constants.events.app.STATUS_UPDATED, this.#onStatusChanged(components))
  }

  async initializeTable(eventEmitter) {
    const components = new ComponentBuilder()
      .setScreen({title: 'Hacker Chat - Luiz Carlos'})
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .setActivityLogComponent()
      .setStatusComponent()
      .build()

    this.#registerEvents(eventEmitter, components)
    components.input.focus()
    components.screen.render()

  //   setInterval(() => {
  //     eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {userName: 'Luiz', message: 'Olá'})
  //     eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {userName: 'João', message: 'Bom dia'})
  //     eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {userName: 'Maria', message: 'Tudo certo?'})
  //     eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'Luiz join')
  //     eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'Luiz left')
  //     eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'João join')
  //     eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'João left')
  //     eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'Maria join')
  //     eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'Maria left')
  //     eventEmitter.emit(constants.events.app.STATUS_UPDATED, ['Luiz', 'Maria', 'João', 'Outro'])
  //   }, 1000);
 
  //

  }  

}