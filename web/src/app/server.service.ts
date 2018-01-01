import { Injectable } from '@angular/core';

import { WorldService } from './world.service';

@Injectable()
export class ServerService {

  private ws: WebSocket;
  public state: string;

  private pending: any[] = [];

  constructor(private world: WorldService) {
    world.server = this;
    this.reconnect();
  }

  public reconnect() {
    this.ws = new WebSocket('ws://localhost:8080/server/ws');

    this.ws.onmessage = message => this.onMessage(message.data);
    this.ws.onopen = () => this.onOpen();
    this.ws.onclose = () => this.onClose();

    this.state = 'connecting';
  }

  public send(events: any) {
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.log('pending', events);
      this.pending.push(events);

      if (this.ws.readyState === WebSocket.CLOSED) {
        this.reconnect();
      }

      return;
    }

    this.ws.send(JSON.stringify(events));
    console.log('send', events);
  }

  private onClose() {
    this.state = 'disconnected';
    console.log('closed');
  }

  private onOpen() {
    this.state = 'connected';
    console.log('opened');

    while(this.pending.length) {
      this.send(this.pending.shift());
    }
  }

  private onMessage(eventsStr: string) {
    this.world.event(JSON.parse(eventsStr));
    console.log('got', JSON.parse(eventsStr));
  }

}
