import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class PublicacionesGateway {
  @WebSocketServer()
  server: Server;

  emitirNuevaPublicacion(publicacion: any) {
    this.server.emit('nueva-publicacion', publicacion);
  }

  emitirActualizacionPublicacion(publicacion: any) {
    this.server.emit('actualizar-publicacion', publicacion);
  }

  emitirEliminacionPublicacion(publicacion: any) {
    this.server.emit('eliminar-publicacion', publicacion);
  }

  emitirNuevoComentario(publicacionId: string, comentario: any) {
    this.server.emit('nuevo-comentario', { publicacionId, comentario });
  }
}
