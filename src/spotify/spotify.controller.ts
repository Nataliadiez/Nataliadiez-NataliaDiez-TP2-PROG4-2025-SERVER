import { Controller, Get } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyTokenResponse } from './spotify.interface';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('token')
  async obtenerToken(): Promise<SpotifyTokenResponse> {
    return await this.spotifyService.obtenerToken();
  }
}
