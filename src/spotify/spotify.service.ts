import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { SpotifyTokenResponse } from './spotify.interface';

@Injectable()
export class SpotifyService {
  private clientId = 'cb6192838b8346e3946ed03c7c6c82b1';
  private clientSecret = '06f9b4e4af214561b60663dade665f12';

  async obtenerToken(): Promise<SpotifyTokenResponse> {
    const authBuffer = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
      const response = await axios.post<SpotifyTokenResponse>(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${authBuffer}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data;
    } catch (err) {
      throw new UnauthorizedException('Error al obtener el token de Spotify');
    }
  }
}
