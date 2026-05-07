import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PokemonInfo {
  id: number;
  nombre: string;
  sprite: string;
  tipos: string[];
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly base = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getPokemon(id: number): Observable<PokemonInfo> {
    return this.http.get<any>(`${this.base}/pokemon/${id}`).pipe(
      map(p => ({
        id: p.id,
        nombre: p.name,
        sprite: p.sprites.front_default,
        tipos: (p.types as any[]).map(t => t.type.name as string),
      }))
    );
  }

  spriteUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  artworkUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
  }

  idForClient(customerId: number, tier: string): number {
    if (tier === 'Gold')   return (customerId % 263) + 387;
    if (tier === 'Silver') return (customerId % 235) + 152;
    return (customerId % 151) + 1;
  }

  randomIdForTier(tier: string): number {
    if (tier === 'Gold')   return this.random(387, 649);
    if (tier === 'Silver') return this.random(152, 386);
    return this.random(1, 151);
  }

  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
